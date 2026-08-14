import { ClientSession, ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { CorrelativoType } from '../types/correlativos'
import { Nivel, Year } from '../types/enums'
import { OperacionPago, ReciboData } from '../types/recibo'

export default class Pagos {
  static async getNextReciboNumber({ year }: { year: Year }) {
    const reciboNumberResponse = await mongoClient.db().collection(`correlativos${year}`).findOne<{ tipo: CorrelativoType; current: number }>({ tipo: 'recibo' })
    let reciboNumber: number
    if (!reciboNumberResponse) {
      reciboNumber = 0
    } else {
      reciboNumber = reciboNumberResponse.current
    }
    return reciboNumber + 1
  }
  static async createNewReciboPago({
    mora,
    nivel,
    year,
    alumnoId,
    fecha,
    descripcion,
    monto_abonado,
    monto_pagado,
    issuer,
    session,
    operacion,
  }: {
    mora: number
    issuer: string
    monto_pagado: number
    nivel: Nivel
    year: Year
    descripcion: string
    alumnoId: string
    fecha: string
    monto_abonado: number
    session: ClientSession
    operacion: OperacionPago
  }) {
    const reciboNumber = await Pagos.getNextReciboNumber({ year })
    const createReciboResponse = await mongoClient
      .db()
      .collection(`recibos${year}`)
      .insertOne(
        {
          numRecibo: reciboNumber,
          nivel,
          alumnoId: new ObjectId(alumnoId),
          fecha,
          operacion,
          detalles: {
            issuer: new ObjectId(issuer),
            descripcion,
            montoPagado: monto_pagado + monto_abonado, // monto previo pagado + el monto actual abonado
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

    return createReciboResponse.insertedId
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
}
