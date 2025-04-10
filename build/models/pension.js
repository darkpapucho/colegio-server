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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
const asistencia_1 = require("../types/asistencia");
class Pension {
    static updateMontoPagarPension({ nivel, year, alumnoId, pensiones }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $set: { pensiones } });
            return response;
        });
    }
    static getListByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const response = db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .aggregate([
                { $lookup: { from: `matriculados${nivel}${year}`, foreignField: '_id', localField: 'alumnoId', as: 'estudiante' } },
                { $project: { _id: 0, alumnoId: 1, pensiones: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } } },
                { $match: { 'estudiante.grado': grado, 'estudiante.seccion': seccion, 'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] } } },
            ]);
            const result = [];
            try {
                for (var _d = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _d = true) {
                    _c = response_1_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = response_1.return)) yield _b.call(response_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        });
    }
    static pagarPensionByAlumnoIdAndMonth({ nivel, year, alumnoId, fecha, mes, monto_abonado, monto_pagar, monto_pagado, issuer, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const pagadoCompletamente = monto_pagado + monto_abonado === monto_pagar ? true : false;
            const session = db_1.mongoClient.startSession();
            session.startTransaction();
            let reciboId = null;
            if (pagadoCompletamente) {
                //crear recibo
                //crear recibo:
                const createReciboResponse = yield db_1.mongoClient
                    .db()
                    .collection(`recibos${year}`)
                    .insertOne({
                    nivel,
                    alumnoId: new mongodb_1.ObjectId(alumnoId),
                    fecha,
                    operacion: nivel === 'inicial' ? 'PEI' : 'PEP',
                    detalles: {
                        issuer: new mongodb_1.ObjectId(issuer),
                        descripcion: `pensión ${asistencia_1.VALID_MONTHS[mes]}`,
                        montoPagado: monto_pagado + monto_abonado,
                    },
                }, { session });
                if (!createReciboResponse.insertedId || !createReciboResponse.acknowledged) {
                    yield session.abortTransaction();
                    session.endSession();
                    throw new Error('error procesando el pago');
                }
                reciboId = createReciboResponse.insertedId;
            }
            //actualizar pension record
            const updatePensionRecordResponse = yield db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId), 'pensiones.mes': mes }, {
                $inc: { 'pensiones.$.monto_pagado': monto_abonado },
                $set: { 'pensiones.$.pagado': pagadoCompletamente, 'pensiones.$.fecha': fecha, 'pensiones.$.reciboId': reciboId },
            }, { session });
            if (!updatePensionRecordResponse.acknowledged || !updatePensionRecordResponse.modifiedCount) {
                yield session.abortTransaction();
                session.endSession();
                throw new Error('error procesando el pago');
            }
            yield session.commitTransaction();
            yield session.endSession();
            return reciboId;
        });
    }
}
exports.default = Pension;
