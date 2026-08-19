import { ClientSession, ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { CorrelativoType } from '../types/correlativos'
import { Nivel, Year } from '../types/enums'
import { OperacionPago, ReciboData } from '../types/recibo'
import { ItemDeuda, OtrasDeudas } from '../types/pagos'

export default class Pagos {
  static async registrarNuevaDeuda({ alumnoId, nivel, year, items, fecha }: { fecha: string; alumnoId: string; nivel: Nivel; year: Year; items: ItemDeuda[] }) {
    let montoTotal = 0
    let abonado = 0

    const parsedItems = items.map((row) => {
      montoTotal += row.cantidad * row.precio_unitario
      abonado += row.abonado
      return { ...row, _id: new ObjectId() }
    })

    const response = await mongoClient
      .db()
      .collection(`otrasdeudas${nivel}${year}`)
      .updateOne(
        { alumnoId: new ObjectId(alumnoId) },
        { push: { items: parsedItems }, $inc: { deudaTotal: montoTotal, abonado: abonado }, $set: { lastUpdateDate: fecha } },
        { upsert: true },
      )
    return response
  }
  static async updateOtrasDeudasAlumno({
    alumnoId,
    nivel,
    year,
    deudaItemId,
    montoAbonado,
    fecha,
  }: {
    montoAbonado: number
    fecha: string
    deudaItemId: string
    alumnoId: string
    nivel: Nivel
    year: Year
  }) {
    const currentData = await mongoClient
      .db()
      .collection<OtrasDeudas>(`otrasdeudas${nivel}$year}`)
      .findOne({ alumnoId: new ObjectId(alumnoId) }, { projection: { abonado: 1, deudaTotal: 1 } })
    if (!currentData) throw new Error('datos inválidos, es probable que este alumno no tenga un historial de deudas aún')
    const {
      deuda: { abonado, deudaTotal },
    } = currentData
    const isTotallyPayed = deudaTotal == abonado + montoAbonado
    const response = await mongoClient
      .db()
      .collection(`otrasdeudas${nivel}${year}`)
      .updateOne(
        { alumnoId: new ObjectId(alumnoId) },
        {
          $set: { lastUpdateDate: fecha, 'items.$[elem].lastUpdateDate': fecha, status: isTotallyPayed ? 'pagado' : 'pendiente' },
          $inc: { abonado: montoAbonado, 'items.$[elem].abonado': montoAbonado },
        },
        { arrayFilters: [{ 'elem._id': new ObjectId(deudaItemId) }] },
      )
    return response
  }
  static async fetchOtrasDeudas({ nivel, year, soloDeudasPendientes }: { nivel: Nivel; year: Year; soloDeudasPendientes: boolean }) {
    const response = await mongoClient
      .db()
      .collection(`otrasdeudas${nivel}${year}`)
      .aggregate<OtrasDeudas>([
        { $match: { 'deudas.status': soloDeudasPendientes ? 'pendiente' : 'pagado' } },
        { $project: { alumnoId: 1, deudas: { $filter: { input: '$deudas', as: 'deuda', cond: { $eq: ['$$deuda.status', soloDeudasPendientes ? 'pendiente' : 'pagado'] } } } } },
        {
          $lookup: {
            from: `matriculados${nivel}${year}`,
            localField: 'alumnoId',
            foreignField: '_id',
            as: 'alumno',
          },
        },
      ])
      .toArray()
    return response
  }
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
