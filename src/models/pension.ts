import { ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { EstadoMatricula, Grado, Nivel, Seccion, Year } from '../types/enums'
import { AMatriculado } from '../types/alumno'
import { PensionRecord } from '../types/pensiones'
import { VALID_MONTHS } from '../types/asistencia'

export default class Pension {
  static async getListAlumnosByNumPensionesAtrasadas({ currentMonth, nivel, year, numeroPensionesAtrasadas }: { currentMonth: number; nivel: Nivel; year: Year; numeroPensionesAtrasadas: number }) {
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
        {
          $project: { numPensionesPagadas: 1, _id: 0, alumnoId: 1, pensiones: 1, comentario: 1, numeroPensionesAtrasadas: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } },
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

  static async getListByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula }: { grado: Grado; seccion: Seccion; nivel: Nivel; year: Year; estadosMatricula?: EstadoMatricula[] }) {
    const response = mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .aggregate<{ alumnoId: ObjectId; pensiones: PensionRecord[]; estudiante: AMatriculado; numPensionesPagadas: number }>([
        { $lookup: { from: `matriculados${nivel}${year}`, foreignField: '_id', localField: 'alumnoId', as: 'estudiante' } },
        { $project: { _id: 0, alumnoId: 1, pensiones: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } } },
        { $match: { 'estudiante.grado': grado, 'estudiante.seccion': seccion, 'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] } } },
        { $sort: { 'estudiante.nombreCompleto': 1 } },
      ])

    const result = []
    for await (const doc of response) {
      result.push(doc)
    }

    return result
  }
  static async pagarPensionByAlumnoIdAndMonth({
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
    if (pagadoCompletamente) {
      //crear recibo
      //crear recibo:
      const createReciboResponse = await mongoClient
        .db()
        .collection(`recibos${year}`)
        .insertOne(
          {
            nivel,
            alumnoId: new ObjectId(alumnoId),
            fecha,
            operacion: nivel === 'inicial' ? 'PEI' : 'PEP',
            detalles: {
              issuer: new ObjectId(issuer),
              descripcion: `pensión ${VALID_MONTHS[mes]}`,
              montoPagado: monto_pagado + monto_abonado,
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
    }
    //actualizar pension record

    const updatePensionRecordResponse = await mongoClient
      .db()
      .collection(`pensiones${nivel}${year}`)
      .updateOne(
        { alumnoId: new ObjectId(alumnoId), 'pensiones.mes': mes },
        {
          $inc: { 'pensiones.$.monto_pagado': monto_abonado, numPensionesPagadas: 1 },
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
