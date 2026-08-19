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
    static registrarNuevaDeuda({ alumnoId, nivel, year, items, fecha }) {
        return __awaiter(this, void 0, void 0, function* () {
            let montoTotal = 0;
            let abonado = 0;
            const parsedItems = items.map((row) => {
                montoTotal += row.cantidad * row.precio_unitario;
                abonado += row.abonado;
                return Object.assign(Object.assign({}, row), { _id: new mongodb_1.ObjectId() });
            });
            const response = yield db_1.mongoClient
                .db()
                .collection(`otrasdeudas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { push: { items: parsedItems }, $inc: { deudaTotal: montoTotal, abonado: abonado }, $set: { lastUpdateDate: fecha } }, { upsert: true });
            return response;
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
                $set: { lastUpdateDate: fecha, 'items.$[elem].lastUpdateDate': fecha, status: isTotallyPayed ? 'pagado' : 'pendiente' },
                $inc: { abonado: montoAbonado, 'items.$[elem].abonado': montoAbonado },
            }, { arrayFilters: [{ 'elem._id': new mongodb_1.ObjectId(deudaItemId) }] });
            return response;
        });
    }
    static fetchOtrasDeudas({ nivel, year, soloDeudasPendientes }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`otrasdeudas${nivel}${year}`)
                .aggregate([
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
                .toArray();
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
