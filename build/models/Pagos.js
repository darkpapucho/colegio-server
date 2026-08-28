"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
class Pagos {
    static updateItemDeudaComentarios({ alumnoId, itemDeudaId, comentarios, fecha, nivel, year, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`otrospagos${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId), 'deuda.items._id': new mongodb_1.ObjectId(itemDeudaId) }, {
                $set: { 'deuda.items._id.$.detalles.comentarios': comentarios, 'deuda.items._id.$.detalles.fecha': fecha },
            });
            return response;
        });
    }
    static pagarItemDeuda({ nivel, year, alumnoId, itemDeudaId, abonado, fecha, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`otrasdeudas${nivel}${year}`)
                .updateOne({
                alumnoId: new mongodb_1.ObjectId(alumnoId),
                'deuda.items._id': new mongodb_1.ObjectId(itemDeudaId),
            }, [
                {
                    $set: {
                        deuda: {
                            $let: {
                                vars: {
                                    itemId: new mongodb_1.ObjectId(itemDeudaId),
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
            ]);
            return response;
        });
    }
    static registrarNuevaDeuda({ alumnoId, nivel, year, item, fecha, issuer }) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemId = new mongodb_1.ObjectId();
            const itemDeuda = Object.assign(Object.assign({}, item), { _id: itemId, issuer: new mongodb_1.ObjectId(issuer) });
            const response = yield db_1.mongoClient
                .db()
                .collection(`otrasdeudas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, // Filter by alumnoId instead of _id
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
            ], { upsert: true });
            if (!response.acknowledged)
                throw new Error('no se pudo registrar la nueva deuda');
            return itemId;
        });
    }
    static updateOtrasDeudasAlumno({ alumnoId, nivel, year, deudaItemId, montoAbonado, fecha, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentData = yield db_1.mongoClient
                .db()
                .collection(`otrasdeudas${nivel}$year}`)
                .findOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { projection: { abonado: 1, deudaTotal: 1 } });
            if (!currentData)
                throw new Error('datos inválidos, es probable que este alumno no tenga un historial de deudas aún');
            const { deuda: { abonado, deudaTotal }, } = currentData;
            const isTotallyPayed = deudaTotal == abonado + montoAbonado;
            const response = yield db_1.mongoClient
                .db()
                .collection(`otrasdeudas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, {
                $set: { 'deuda.lastUpdateDate': fecha, 'deuda.items.$[elem].lastUpdateDate': fecha, 'deuda.status': isTotallyPayed ? 'pagado' : 'pendiente' },
                $inc: { 'deuda.abonado': montoAbonado, 'deuda.items.$[elem].abonado': montoAbonado },
            }, { arrayFilters: [{ 'elem._id': new mongodb_1.ObjectId(deudaItemId) }] });
            return response;
        });
    }
    static fetchOtrasDeudas({ nivel, year, soloDeudasPendientes }) {
        return __awaiter(this, void 0, void 0, function* () {
            // Construir el pipeline de forma más robusta
            const pipeline = [];
            // 1. Match inicial (si hay filtro por deuda pendiente)
            if (soloDeudasPendientes != false) {
                pipeline.push({
                    $match: {
                        'deuda.status': 'pendiente', // Asegúrate que 'deuda' existe en el documento original
                    },
                });
            }
            // 2. Proyección inicial
            pipeline.push({
                $project: {
                    alumnoId: 1,
                    deuda: 1,
                    // Opcional: incluir otros campos que necesites
                },
            });
            // 3. Lookup para obtener datos del alumno
            pipeline.push({
                $lookup: {
                    from: `matriculados${nivel}${year}`,
                    localField: 'alumnoId',
                    foreignField: '_id',
                    as: 'alumno',
                },
            });
            // 4. Desestructurar el array de alumno
            pipeline.push({
                $project: {
                    alumno: { $arrayElemAt: ['$alumno', 0] },
                    deuda: 1,
                    alumnoId: 1,
                },
            });
            const response = yield db_1.mongoClient.db().collection(`otrasdeudas${nivel}${year}`).aggregate(pipeline).toArray();
            return response;
        });
    }
    static getNextReciboNumber({ year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reciboNumberResponse = yield db_1.mongoClient.db().collection(`correlativos${year}`).findOne({ tipo: 'recibo' });
            let reciboNumber;
            if (!reciboNumberResponse) {
                reciboNumber = 0;
            }
            else {
                reciboNumber = reciboNumberResponse.current;
            }
            return reciboNumber + 1;
        });
    }
    static createNewReciboPago({ mora, nivel, year, alumnoId, fecha, descripcion, monto_abonado, monto_pagado, issuer, session, operacion, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const reciboNumber = yield Pagos.getNextReciboNumber({ year });
            const createReciboResponse = yield db_1.mongoClient
                .db()
                .collection(`recibos${year}`)
                .insertOne({
                numRecibo: reciboNumber,
                nivel,
                alumnoId: new mongodb_1.ObjectId(alumnoId),
                fecha,
                operacion,
                detalles: {
                    issuer: new mongodb_1.ObjectId(issuer),
                    descripcion,
                    montoPagado: monto_pagado + monto_abonado, // monto previo pagado + el monto actual abonado
                    mora,
                },
            }, { session });
            if (!createReciboResponse.insertedId || !createReciboResponse.acknowledged) {
                yield session.abortTransaction();
                session.endSession();
                throw new Error('error procesando el pago');
            }
            return createReciboResponse.insertedId;
        });
    }
    static requestReciboById({ nivel, year, reciboId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield db_1.mongoClient
                .db()
                .collection(`recibos${year}`)
                .aggregate([
                { $match: { _id: new mongodb_1.ObjectId(reciboId), nivel } },
                { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'alumno' } },
                { $project: { numRecibo: 1, nivel: 1, fecha: 1, operacion: 1, detalles: 1, alumno: { $arrayElemAt: ['$alumno', 0] } } },
            ])
                .next());
            return response;
        });
    }
}
exports.default = Pagos;
