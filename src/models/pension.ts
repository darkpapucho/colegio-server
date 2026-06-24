import { ClientSession, ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { EstadoMatricula, Grado, Nivel, Seccion, Year } from '../types/enums'
import { AMatriculado } from '../types/alumno'
import { PensionRecord } from '../types/pensiones'
import { VALID_MONTHS } from '../types/asistencia'
import { CorrelativoType } from '../types/correlativos'
import { ReciboData } from '../types/recibo'

export default class Pension {
  static async getHistorialRecaudaciones({ nivel, year }: { nivel: Nivel; year: Year }) {
    const currentMonth = new Date().getMonth()
    const response = await mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .aggregate([
        { $match: { estadoMatricula: 'DEFINITIVA' } },
        { $lookup: { from: `pensiones${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'pensiones' } },
        { $unwind: '$pensiones' },
        {
          $addFields: {
            data: {
              $filter: {
                input: '$pensiones.pensiones',
                as: 'p',
                cond: {
                  $lte: ['$$p.mes', currentMonth],
                },
              },
            },
          },
        },
        {
          $unwind: '$data',
        },
        { $project: { data: 1 } },
        {
          $group: {
            _id: '$data.mes',
            total: { $sum: '$data.monto_pagar' },
            recaudado: { $sum: '$data.monto_pagado' },
            pendiente: { $sum: { $subtract: ['$data.monto_pagar', '$data.monto_pagado'] } },
            // porcentaje: { $cond: [{ $eq: ['$data.monto_pagar', 0] }, 0, { $avg: { $multiply: [{ $divide: ['$data.monto_pagado', '$data.monto_pagar'] }, 100] } }] },
          },
        },
        {
          $addFields: {
            porcentaje: {
              $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [100, { $divide: ['$recaudado', '$total'] }] }],
            },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()
    return response
  }
  static async getRecaudacionMesActual({ nivel, year }: { nivel: Nivel; year: Year }) {
    const currentMonth = new Date().getMonth()

    const response = await mongoClient
      .db()
      .collection(`alumnos${nivel}${year}`)
      .aggregate([
        {
          $match: {
            estadoMatricula: 'DEFINITIVA',
          },
        },
        {
          $lookup: {
            from: `pensiones${nivel}${year}`,
            localField: '_id',
            foreignField: 'alumnoId',
            as: 'pensiones',
          },
        },
        {
          $addFields: {
            currentMonth: {
              $filter: {
                input: '$pensiones.pensiones',
                as: 'p',
                cond: { $eq: ['$$p.mes', currentMonth] },
              },
            },
          },
        },
        {
          $unwind: '$currentMonth',
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$currentMonth.monto_pagar' },
            recaudado: { $sum: '$currenthMonth.monto_pagado' },
          },
        },
      ])
      .toArray()

    return response[0]
  }
  static async getAlumnosEnRiesgoDeSuspension({ nivel, year }: { nivel: Nivel; year: Year }) {
    const currentMonth = new Date().getMonth()
    const numDePensionesAtrasadasAntesDeSuspension = 2
    const response = mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .aggregate([
        {
          $match: { estadoMatricula: 'DEFINITIVA' },
        },
        {
          $lookup: {
            from: `pensiones${nivel}${year}`,
            localField: '_id',
            foreignField: 'alumnoId',
            as: 'pensiones',
          },
        },
        { $unwind: '$pensiones' },
        {
          $addFields: {
            numPensionesAtrasadas: {
              $size: {
                $filter: {
                  input: '$pensiones.pensiones',
                  as: 'pension',
                  cond: {
                    $and: [{ $gte: ['$$pension.mes', 1] }, { $lt: ['$$pension.mes', currentMonth] }, { $eq: ['$$pension.pagado', false] }],
                  },
                },
              },
            },
          },
        },
        { $match: { numPensionesAtrasadas: { $gte: numDePensionesAtrasadasAntesDeSuspension } } },
        {
          $addFields: {
            pensionesAtrasadas: {
              $filter: {
                input: '$pensiones.pensiones',
                as: 'p',
                cond: {
                  $and: [{ $lt: ['$$p.mes', currentMonth] }, { $eq: ['$$p.pagado', false] }],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            nombreCompleto: 1,
            grado: 1,
            seccion: 1,
            pensiones: '$pensionesAtrasadas',
            apoderados: 1,
            ultimoCobro: '$pensiones.ultimoCobro',
            numPensionesAtrasadas: 1,
          },
        },
      ])
    const result = []
    for await (const doc of response) {
      result.push(doc)
    }
    return result
  }
  static async calcularPensionesPorCobrar({ nivel, year }: { nivel: Nivel; year: Year }) {
    const currentMonth = new Date().getMonth()
    const response = mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .aggregate([
        {
          $match: {
            estadoMatricula: 'DEFINITIVA',
          },
        },
        {
          $lookup: {
            from: `pensiones${nivel}${year}`,
            localField: '_id',
            foreignField: 'alumnoId',
            as: 'pensionData',
          },
        },
        {
          $unwind: '$pensionData',
        },
        {
          $addFields: {
            mesesDeuda: {
              $size: {
                $filter: {
                  input: '$pensionData.pensiones',
                  as: 'pension',
                  cond: {
                    $and: [{ $lt: ['$$pension.mes', currentMonth] }, { $eq: ['$$pension.pagado', false] }],
                  },
                },
              },
            },
          },
        },
        {
          $match: {
            mesesDeuda: { $gt: 0 }, // Solo alumnos con deuda
          },
        },

        {
          $group: {
            _id: '$mesesDeuda',
            cantidadAlumnos: { $sum: 1 },
            montoTotalPorCobrar: {
              $sum: {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$pensionData.pensiones',
                      as: 'p',
                      cond: {
                        $and: [{ $lt: ['$$p.mes', currentMonth] }, { $eq: ['$$p.pagado', false] }],
                      },
                    },
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.monto_pagar'] },
                },
              },
            },
          },
        },
        {
          $sort: { _id: 1 }, // Ordenar por número de meses
        },
        {
          $project: {
            _id: 0,
            mesesDeuda: '$_id',
            cantidadAlumnos: 1,
            montoTotalPorCobrar: 1,
          },
        },
      ])
    const result = []
    for await (const doc of response) {
      result.push(doc)
    }
    return result
  }
  static async cobrarPension({ alumnoId, detalle, fecha, nivel, year }: { alumnoId: string; detalle: any; fecha: string; nivel: Nivel; year: Year }) {
    const response = await mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $set: { ultimoCobro: { detalle, fecha } } })
    return response
  }
  static async getRetrasadosList({ nivel, year, grado, seccion, mes }: { mes: number; nivel: Nivel; year: Year; grado: Grado; seccion: Seccion }) {
    const currentMonth = mes

    const response = mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .aggregate([
        { $match: { grado, seccion, estadoMatricula: { $in: ['DEFINITIVA'] } } },
        {
          $lookup: {
            from: `pensiones${nivel}${year}`,
            localField: '_id',
            foreignField: 'alumnoId',
            as: 'pensionInfo',
          },
        },
        {
          $unwind: '$pensionInfo',
        },
        // {
        //   $addFields: {
        //     mesActual: { $month: new Date() }, // Toma el mes actual automáticamente
        //     anioActual: { $year: new Date() },
        //   },
        // },
        {
          $addFields: {
            mesesAtraso: {
              $filter: {
                input: '$pensionInfo.pensiones',
                as: 'pension',
                cond: {
                  $and: [{ $gte: ['$$pension.mes', 2] }, { $lte: ['$$pension.mes', currentMonth] }, { $eq: ['$$pension.pagado', false] }],
                },
              },
            },
          },
        },
        {
          $match: {
            $expr: { $gt: [{ $size: '$mesesAtraso' }, 0] },
          },
        },
        {
          $project: {
            _id: 1,
            nombreCompleto: 1,
            grado: 1,
            seccion: 1,
            dni: 1,
            apoderados: 1,
            codigoEstudiante: 1,
            mesesAtrasoDetalle: '$mesesAtraso',
            totalMesesAtraso: { $size: '$mesesAtraso' },
            pensionesPagadas: '$pensionInfo.numPensionesPagadas',
            ultimoCobro: '$pensionInfo.ultimoCobro',
          },
        },
      ])
    const result: any[] = []
    for await (const doc of response) {
      result.push(doc)
    }
    return result
  }
  static async getPrecioPension({ nivel, year }: { nivel: Nivel; year: Year }) {
    const response = await mongoClient
      .db()
      .collection(`pensiones${year}`)
      .findOne<{ costo: number }>({ nivel }, { projection: { costo: true, _id: false } })
    return response
  }

  static async requestReciboById({ nivel, year, reciboId }: { nivel: Nivel; year: Year; reciboId: string }) {
    const response = (await mongoClient
      .db()
      .collection(`recibos${year}`)
      .aggregate([
        { $match: { _id: new ObjectId(reciboId), nivel } },
        { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'alumno' } },
        { $project: { numRecibo: 1, nivel: 1, fecha: 1, operacion: 1, detalles: 1, alumno: { $arrayElemAt: ['$alumno', 0] } } },
      ])
      .next()) as ReciboData | null
    return response
  }
  static async getLastUpdateDate({ year, nivel }: { nivel: Nivel; year: Year }) {
    const response = await mongoClient
      .db()
      .collection('pensionesLastUpdateDate')
      .findOne<{ date: string }>({ nivel, year }, { projection: { date: true, _id: false } })
    return response
  }
  static async setLastUpdateDate({ date, year, nivel }: { year: Year; nivel: Nivel; date: string }) {
    const response = await mongoClient.db().collection('pensionesLastUpdateDate').updateOne({ nivel, year }, { $set: { date } }, { upsert: true })
    return response
  }
  static async getRecordPensionesPagadasByDateRange({ nivel, year, initDate, endDate }: { nivel: Nivel; year: Year; initDate: string; endDate: string }) {
    initDate = initDate + 'T00:00'
    endDate = endDate + 'T23:59'
    // const response = mongoClient
    //   .db()
    //   .collection(`pensiones${nivel}${year}`)
    //   .aggregate<{ alumno: { dni: string; nombreCompleto: string; grado: Grado; seccion: Seccion }; pensiones: Pension[] }>([
    //     { $match: {} },
    //     {
    //       $project: {
    //         alumnoId: 1,
    //         pensiones: {
    //           $filter: {
    //             input: '$pensiones',
    //             as: 'pensiones',
    //             cond: { $and: [{ $gte: ['$$pensiones.fecha', initDate] }, { $lte: ['$$pensiones.fecha', endDate] }] },
    //           },
    //         },
    //       },
    //     },
    //     { $match: { 'pensiones.0': { $exists: true } } },
    //     { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'alumno' } },
    //     { $project: { pensiones: 1, alumno: { $arrayElemAt: ['$alumno', 0] } } },
    //     { $project: { pensiones: 1, 'alumno.nombreCompleto': 1, 'alumno.grado': 1, 'alumno.seccion': 1, 'alumno.dni': 1 } },

    //     { $sort: { 'alumno.nombreCompleto': 1 } },
    //   ])
    const response = await mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .aggregate([
        { $match: {} },
        {
          $project: {
            alumnoId: 1,
            pensiones: {
              $filter: {
                input: '$pensiones',
                as: 'pension',
                cond: {
                  $and: [{ $gte: ['$$pension.fecha', initDate] }, { $lte: ['$$pension.fecha', endDate] }],
                },
              },
            },
          },
        },
        { $match: { 'pensiones.0': { $exists: true } } },

        // Lookup para obtener datos del alumno
        {
          $lookup: {
            from: `matriculados${nivel}${year}`,
            localField: 'alumnoId',
            foreignField: '_id',
            as: 'alumno',
          },
        },

        // Desestructurar el array de alumno para trabajar más fácil
        { $unwind: '$alumno' },

        // Desestructurar cada pensión para tratarlas individualmente
        { $unwind: '$pensiones' },

        // Lookup del recibo para cada pensión
        {
          $lookup: {
            from: `recibos${year}`,
            localField: 'pensiones.reciboId',
            foreignField: '_id',
            as: 'recibo',
          },
        },

        // Desestructurar el recibo (si existe)
        { $unwind: { path: '$recibo', preserveNullAndEmptyArrays: true } },

        // Lookup del empleado que emitió el recibo
        {
          $lookup: {
            from: `empleados${nivel}${year}`,
            localField: 'recibo.detalles.issuer',
            foreignField: 'userId',
            as: 'empleado',
          },
        },

        // Desestructurar el empleado (si existe)
        { $unwind: { path: '$empleado', preserveNullAndEmptyArrays: true } },

        // Agrupar nuevamente por el documento original de pensiones
        {
          $group: {
            _id: '$_id',
            alumno: { $first: '$alumno' },
            pensiones: {
              $push: {
                mes: '$pensiones.mes',
                monto_pagar: '$pensiones.monto_pagar',
                monto_pagado: '$pensiones.monto_pagado',
                pagado: '$pensiones.pagado',
                fecha: '$pensiones.fecha',
                reciboId: '$pensiones.reciboId',
                numRecibo: '$recibo.numRecibo',
                issuerNombres: '$empleado.nombres',
                issuerApellidos: '$empleado.apellidos',
                issuerId: '$recibo.detalles.issuer', // Opcional: para verificar el ID
              },
            },
          },
        },

        // Proyección final para limpiar el resultado
        {
          $project: {
            _id: 0,
            'alumno.dni': 1,
            'alumno.nombreCompleto': 1,
            'alumno.grado': 1,
            'alumno.seccion': 1,
            pensiones: 1,
          },
        },

        // Ordenar por nombre completo del alumno
        { $sort: { 'alumno.nombreCompleto': 1 } },
      ])
      .toArray()
    return response
  }
  static async getListAlumnosByNumPensionesAtrasadas({
    currentMonth,
    nivel,
    year,
    numeroPensionesAtrasadas,
  }: {
    currentMonth: number
    nivel: Nivel
    year: Year
    numeroPensionesAtrasadas: number
  }) {
    const cursor = mongoClient
      .db()
      .collection<{ alumnoId: ObjectId; pensiones: PensionRecord[]; numPensionesPagadas: number }>(`pensiones${nivel}${year}`)
      .aggregate<{ comentario?: { fecha: string; detalle: string }; numeroPensionesAtrasadas: number; alumnoId: string; pensiones: PensionRecord[]; estudiante: AMatriculado }>([
        {
          $match: {
            $expr: {
              $eq: [
                '$numPensionesPagadas',
                {
                  $subtract: [
                    {
                      $subtract: [{ $subtract: [currentMonth, 1] }, numeroPensionesAtrasadas],
                    },
                    { $subtract: [10, { $size: '$pensiones' }] },
                  ],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            numeroPensionesAtrasadas,
          },
        },
        {
          $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' },
        },
        { $lookup: { from: `anotacionesRelevantes${nivel}${year}`, localField: 'alumnoId', foreignField: 'alumnoId', as: 'comentario' } },
        {
          $project: {
            comentario: { $arrayElemAt: ['$comentario', 0] },
            numPensionesPagadas: 1,
            _id: 0,
            alumnoId: 1,
            pensiones: 1,
            numeroPensionesAtrasadas: 1,
            estudiante: { $arrayElemAt: ['$estudiante', 0] },
          },
        },

        { $sort: { 'estudiante.grado': 1, 'estudiante.seccion': 1 } },
      ])
    const result = []
    for await (const doc of cursor) {
      result.push(doc)
    }

    return result
  }
  static async getPensionesGlobalReport({ nivel, year }: { nivel: Nivel; year: Year }) {
    const cursor = mongoClient.db().collection<{ alumnoId: ObjectId; pensiones: PensionRecord[]; numPensionesPagadas: number }>(`pensiones${nivel}${year}`).find({})
    const list = []
    for await (const doc of cursor) {
      list.push(doc)
    }
    return list
  }
  static async updateMontoPagarPension({ nivel, year, alumnoId, pensiones }: { nivel: Nivel; year: Year; alumnoId: string; pensiones: PensionRecord[] }) {
    const response = mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $set: { pensiones } })
    return response
  }

  static async getListByGradoSeccion({
    nivel,
    year,
    grado,
    seccion,
    estadosMatricula,
  }: {
    grado: Grado
    seccion: Seccion
    nivel: Nivel
    year: Year
    estadosMatricula?: EstadoMatricula[]
  }) {
    const response = mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .aggregate<{ alumnoId: ObjectId; pensiones: PensionRecord[]; estudiante: AMatriculado; numPensionesPagadas: number }>([
        { $lookup: { from: `matriculados${nivel}${year}`, foreignField: '_id', localField: 'alumnoId', as: 'estudiante' } },
        { $project: { _id: 0, alumnoId: 1, pensiones: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } } },
        {
          $match: {
            'estudiante.grado': grado,
            'estudiante.seccion': seccion,
            'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA'] },
          },
        },
        { $sort: { 'estudiante.nombreCompleto': 1 } },
      ])

    const result = []
    for await (const doc of response) {
      result.push(doc)
    }

    return result
  }

  static async getListByNivel({ nivel, year, estadosMatricula, session }: { nivel: Nivel; year: Year; estadosMatricula?: EstadoMatricula; session?: ClientSession }) {
    const cursor = mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .aggregate<{ nombreCompleto: string; grado: Grado; seccion: Seccion; pensiones: PensionRecord[] }>(
        [
          { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
          { $project: { pensiones: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } } },
          { $match: { 'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA'] } } },
          { $project: { nombreCompleto: '$estudiante.nombreCompleto', grado: '$estudiante.grado', seccion: '$estudiante.seccion', pensiones: 1 } },
        ],
        { session },
      )
    const response = []
    for await (const doc of cursor) {
      response.push(doc)
    }
    return response
  }

  static async pagarPensionByAlumnoIdAndMonth({
    mora,
    nivel,
    year,
    alumnoId,
    fecha,
    mes,
    monto_abonado,
    monto_pagar,
    monto_pagado,
    issuer,
  }: {
    mora: number
    issuer: string
    monto_pagar: number
    monto_pagado: number
    nivel: Nivel
    year: Year
    mes: number
    alumnoId: string
    fecha: string
    monto_abonado: number
  }) {
    const pagadoCompletamente: boolean = monto_pagado + monto_abonado === monto_pagar ? true : false
    const session = mongoClient.startSession()
    session.startTransaction()
    let reciboId: ObjectId | null = null

    //si esta pagado completamente, creamos un recibo y incrementamos el correlativo de recibos
    if (pagadoCompletamente) {
      //fetch numero de recibo:
      const reciboNumberResponse = await mongoClient.db().collection(`correlativos${year}`).findOne<{ tipo: CorrelativoType; current: number }>({ tipo: 'recibo' })
      let reciboNumber: number
      if (!reciboNumberResponse) {
        reciboNumber = 0
      } else {
        reciboNumber = reciboNumberResponse.current
      }
      //crear recibo:
      const createReciboResponse = await mongoClient
        .db()
        .collection(`recibos${year}`)
        .insertOne(
          {
            numRecibo: reciboNumber + 1,
            nivel,
            alumnoId: new ObjectId(alumnoId),
            fecha,
            operacion: nivel === 'inicial' ? 'PEI' : nivel === 'primaria' ? 'PEP' : 'PES',
            detalles: {
              issuer: new ObjectId(issuer),
              descripcion: `pensión ${VALID_MONTHS[mes]}`,
              montoPagado: monto_pagado + monto_abonado,
              mora,
            },
          },
          { session },
        )

      if (!createReciboResponse.insertedId || !createReciboResponse.acknowledged) {
        await session.abortTransaction()
        session.endSession()
        throw new Error('error procesando el pago')
      }
      reciboId = createReciboResponse.insertedId
      //increase the current in the correlativos:

      const increaseCorrelativoResponse = await mongoClient
        .db()
        .collection(`correlativos${year}`)
        .updateOne({ tipo: 'recibo' }, { $set: { current: reciboNumber + 1 } }, { upsert: true, session })

      if (!increaseCorrelativoResponse.acknowledged) {
        await session.abortTransaction()
        await session.endSession()
        throw new Error('error procesando el pago, incremento del correlativo')
      }
    }

    //actualizar pension record

    const updatePensionRecordResponse = await mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .updateOne(
        { alumnoId: new ObjectId(alumnoId), 'pensiones.mes': mes },
        {
          $inc: { 'pensiones.$.monto_pagado': monto_abonado, numPensionesPagadas: pagadoCompletamente ? 1 : 0 },
          $set: { 'pensiones.$.pagado': pagadoCompletamente, 'pensiones.$.fecha': fecha, 'pensiones.$.reciboId': reciboId },
        },
        { session },
      )

    if (!updatePensionRecordResponse.acknowledged || !updatePensionRecordResponse.modifiedCount) {
      await session.abortTransaction()
      session.endSession()
      throw new Error('error procesando el pago')
    }
    await session.commitTransaction()
    await session.endSession()
    return reciboId
  }
}
