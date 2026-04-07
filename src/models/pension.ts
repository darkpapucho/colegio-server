import { ClientSession, ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { EstadoMatricula, Grado, Nivel, Seccion, Year } from '../types/enums'
import { AMatriculado } from '../types/alumno'
import { PensionRecord } from '../types/pensiones'
import { VALID_MONTHS } from '../types/asistencia'
import { CorrelativoType } from '../types/correlativos'
import { ReciboData } from '../types/recibo'


export default class Pension {
  static async getPrecioPension({ nivel, year }: { nivel: Nivel; year: Year }) {
    const response = await mongoClient.db().collection(`pensiones${year}`).findOne<{ costo: number }>({ nivel }, { projection: { costo: true, _id: false } })
    return response;
  }

  static async requestReciboById({ nivel, year, reciboId }: { nivel: Nivel; year: Year; reciboId: string }) {
    const response = await mongoClient.db().collection(`recibos${year}`).aggregate([{$match: {_id: new ObjectId(reciboId), nivel}}, {$lookup: {from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'alumno'}}, {$project: {numRecibo: 1, nivel: 1, fecha: 1, operacion: 1, detalles: 1, alumno: {$arrayElemAt: ['$alumno', 0]}}}]).next() as ReciboData | null
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
    const response = mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .aggregate<{ alumno: { dni: string; nombreCompleto: string; grado: Grado; seccion: Seccion }; pensiones: Pension[] }>([
        { $match: {} },
        {
          $project: {
            alumnoId: 1,
            pensiones: { $filter: { input: '$pensiones', as: 'pensiones', cond: { $and: [{ $gte: ['$$pensiones.fecha', initDate] }, { $lte: ['$$pensiones.fecha', endDate] }] } } },
          },
        },
        { $match: { 'pensiones.0': { $exists: true } } },
        { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'alumno' } },
        { $project: { pensiones: 1, alumno: { $arrayElemAt: ['$alumno', 0] } } },
        { $project: { pensiones: 1, 'alumno.nombreCompleto': 1, 'alumno.grado': 1, 'alumno.seccion': 1, 'alumno.dni': 1 } },
        { $sort: { 'alumno.nombreCompleto': 1 } },
      ])
    const result = []
    for await (const doc of response) {
      result.push(doc)
    }

    return result
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
            'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] },
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
          { $match: { 'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] } } },
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
    mora:number,
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
