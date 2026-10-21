import { ClientSession, Document, ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { CorrelativoType } from '../types/correlativos'
import { Nivel, Year } from '../types/enums'
import { OperacionPago, ReciboData } from '../types/recibo'
import { ItemDeuda, OtrasDeudas } from '../types/pagos'

export default class Pagos {
  static async updateItemDeudaComentarios({
    alumnoId,
    itemDeudaId,
    comentarios,
    fecha,
    nivel,
    year,
  }: {
    nivel: Nivel
    year: Year
    alumnoId: string
    itemDeudaId: string
    comentarios: string
    fecha: string
  }) {
    const response = await mongoClient
      .db()
      .collection(`otrasdeudas${nivel}${year}`)
      .updateOne(
        {
          alumnoId: new ObjectId(alumnoId),
          'deuda.items._id': new ObjectId(itemDeudaId),
        },
        {
          $set: {
            'deuda.items.$.detalles.comentarios': comentarios,
            'deuda.items.$.detalles.fecha': fecha,
          },
        },
      )
    return response
  }
  static async pagarItemDeuda({
    nivel,
    year,
    alumnoId,
    itemDeudaId,
    abonado,
    fecha,
  }: {
    fecha: string
    nivel: Nivel
    year: Year
    alumnoId: string
    itemDeudaId: string
    abonado: number
  }) {
    const response = await mongoClient
      .db()
      .collection(`otrasdeudas${nivel}${year}`)
      .updateOne(
        {
          alumnoId: new ObjectId(alumnoId),
          'deuda.items._id': new ObjectId(itemDeudaId),
        },
        [
          {
            $set: {
              deuda: {
                $let: {
                  vars: {
                    itemId: new ObjectId(itemDeudaId),
                    paymentAmount: abonado,
                    currentDeuda: '$deuda',
                    today: fecha, // Or use new Date() for proper dates
                  },
                  in: {
                    $mergeObjects: [
                      '$$currentDeuda',
                      {
                        items: {
                          $map: {
                            input: '$$currentDeuda.items',
                            as: 'item',
                            in: {
                              $cond: [
                                { $eq: ['$$item._id', '$$itemId'] },
                                {
                                  $mergeObjects: [
                                    '$$item',
                                    {
                                      abonado: { $add: ['$$item.abonado', '$$paymentAmount'] },
                                      lastUpdateDate: '$$today',
                                    },
                                  ],
                                },
                                '$$item',
                              ],
                            },
                          },
                        },
                        deudaTotal: {
                          $subtract: ['$$currentDeuda.deudaTotal', '$$paymentAmount'],
                        },
                        lastUpdateDate: '$$today',
                        status: {
                          $cond: [{ $eq: [{ $subtract: ['$$currentDeuda.deudaTotal', '$$paymentAmount'] }, 0] }, 'cancelado', '$$currentDeuda.status'],
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
      )
    return response
  }
  static async registrarNuevaDeuda({ alumnoId, nivel, year, item, fecha, issuer }: { issuer: string; fecha: string; alumnoId: string; nivel: Nivel; year: Year; item: ItemDeuda }) {
    const itemId = new ObjectId()
    const itemDeuda = { ...item, _id: itemId, issuer: new ObjectId(issuer) }
    const response = await mongoClient
      .db()
      .collection(`otrasdeudas${nivel}${year}`)
      .updateOne(
        { alumnoId: new ObjectId(alumnoId) }, // Filter by alumnoId instead of _id
        [
          {
            $set: {
              deuda: {
                $let: {
                  vars: {
                    newItem: itemDeuda,
                  },
                  in: {
                    $mergeObjects: [
                      { $ifNull: ['$deuda', { deudaTotal: 0, items: [], lastUpdateDate: '', status: 'pendiente' }] },
                      {
                        items: {
                          $concatArrays: [{ $ifNull: ['$deuda.items', []] }, ['$$newItem']],
                        },
                        deudaTotal: {
                          $add: [
                            { $ifNull: ['$deuda.deudaTotal', 0] },
                            {
                              $subtract: [{ $multiply: ['$$newItem.precio_unitario', '$$newItem.cantidad'] }, '$$newItem.abonado'],
                            },
                          ],
                        },
                        lastUpdateDate: fecha,
                        status: 'pendiente',
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
        { upsert: true },
      )

    if (!response.acknowledged) throw new Error('no se pudo registrar la nueva deuda')
    return itemId
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
          $set: { 'deuda.lastUpdateDate': fecha, 'deuda.items.$[elem].lastUpdateDate': fecha, 'deuda.status': isTotallyPayed ? 'pagado' : 'pendiente' },
          $inc: { 'deuda.abonado': montoAbonado, 'deuda.items.$[elem].abonado': montoAbonado },
        },
        { arrayFilters: [{ 'elem._id': new ObjectId(deudaItemId) }] },
      )
    return response
  }
  static async fetchOtrasDeudas({ nivel, year, soloDeudasPendientes }: { nivel: Nivel; year: Year; soloDeudasPendientes: boolean }) {
    // Construir el pipeline de forma más robusta
    const pipeline: Document[] = []

    // 1. Match inicial (si hay filtro por deuda pendiente)
    if (soloDeudasPendientes != false) {
      pipeline.push({
        $match: {
          'deuda.status': 'pendiente', // Asegúrate que 'deuda' existe en el documento original
        },
      })
    }

    // 2. Proyección inicial
    pipeline.push({
      $project: {
        alumnoId: 1,
        deuda: 1,
        // Opcional: incluir otros campos que necesites
      },
    })

    // 3. Lookup para obtener datos del alumno
    pipeline.push({
      $lookup: {
        from: `matriculados${nivel}${year}`,
        localField: 'alumnoId',
        foreignField: '_id',
        as: 'alumno',
      },
    })

    // 4. Desestructurar el array de alumno
    pipeline.push({
      $project: {
        alumno: { $arrayElemAt: ['$alumno', 0] },
        deuda: 1,
        alumnoId: 1,
      },
    })

    const response = await mongoClient.db().collection(`otrasdeudas${nivel}${year}`).aggregate<OtrasDeudas>(pipeline).toArray()

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
