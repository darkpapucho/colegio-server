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
    static getAlumnosEnRiesgoDeSuspension({ nivel, year }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const currentMonth = new Date().getMonth();
            const numDePensionesAtrasadasAntesDeSuspension = 2;
            const response = db_1.mongoClient
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
    static calcularPensionesPorCobrar({ nivel, year }) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const currentMonth = new Date().getMonth();
            const response = db_1.mongoClient
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
            ]);
            const result = [];
            try {
                for (var _d = true, response_2 = __asyncValues(response), response_2_1; response_2_1 = yield response_2.next(), _a = response_2_1.done, !_a; _d = true) {
                    _c = response_2_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = response_2.return)) yield _b.call(response_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        });
    }
    static cobrarPension({ alumnoId, detalle, fecha, nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $set: { ultimoCobro: { detalle, fecha } } });
            return response;
        });
    }
    static getRetrasadosList({ nivel, year, grado, seccion }) {
        var _a, e_3, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const currentMonth = new Date().getMonth();
            const response = db_1.mongoClient
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
                                    $and: [{ $gte: ['$$pension.mes', 2] }, { $lt: ['$$pension.mes', currentMonth] }, { $eq: ['$$pension.pagado', false] }],
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
            ]);
            const result = [];
            try {
                for (var _d = true, response_3 = __asyncValues(response), response_3_1; response_3_1 = yield response_3.next(), _a = response_3_1.done, !_a; _d = true) {
                    _c = response_3_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = response_3.return)) yield _b.call(response_3);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return result;
        });
    }
    static getPrecioPension({ nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`pensiones${year}`)
                .findOne({ nivel }, { projection: { costo: true, _id: false } });
            return response;
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
    static getLastUpdateDate({ year, nivel }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection('pensionesLastUpdateDate')
                .findOne({ nivel, year }, { projection: { date: true, _id: false } });
            return response;
        });
    }
    static setLastUpdateDate({ date, year, nivel }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient.db().collection('pensionesLastUpdateDate').updateOne({ nivel, year }, { $set: { date } }, { upsert: true });
            return response;
        });
    }
    static getRecordPensionesPagadasByDateRange({ nivel, year, initDate, endDate }) {
        var _a, e_4, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            initDate = initDate + 'T00:00';
            endDate = endDate + 'T23:59';
            const response = db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .aggregate([
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
            ]);
            const result = [];
            try {
                for (var _d = true, response_4 = __asyncValues(response), response_4_1; response_4_1 = yield response_4.next(), _a = response_4_1.done, !_a; _d = true) {
                    _c = response_4_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = response_4.return)) yield _b.call(response_4);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return result;
        });
    }
    static getListAlumnosByNumPensionesAtrasadas({ currentMonth, nivel, year, numeroPensionesAtrasadas, }) {
        var _a, e_5, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .aggregate([
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
            ]);
            const result = [];
            try {
                for (var _d = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _d = true) {
                    _c = cursor_1_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return result;
        });
    }
    static getPensionesGlobalReport({ nivel, year }) {
        var _a, e_6, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient.db().collection(`pensiones${nivel}${year}`).find({});
            const list = [];
            try {
                for (var _d = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _a = cursor_2_1.done, !_a; _d = true) {
                    _c = cursor_2_1.value;
                    _d = false;
                    const doc = _c;
                    list.push(doc);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_2.return)) yield _b.call(cursor_2);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return list;
        });
    }
    static updateMontoPagarPension({ nivel, year, alumnoId, pensiones }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $set: { pensiones } });
            return response;
        });
    }
    static getListByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula, }) {
        var _a, e_7, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const response = db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .aggregate([
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
            ]);
            const result = [];
            try {
                for (var _d = true, response_5 = __asyncValues(response), response_5_1; response_5_1 = yield response_5.next(), _a = response_5_1.done, !_a; _d = true) {
                    _c = response_5_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = response_5.return)) yield _b.call(response_5);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return result;
        });
    }
    static getListByNivel({ nivel, year, estadosMatricula, session }) {
        var _a, e_8, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .aggregate([
                { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
                { $project: { pensiones: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } } },
                { $match: { 'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA'] } } },
                { $project: { nombreCompleto: '$estudiante.nombreCompleto', grado: '$estudiante.grado', seccion: '$estudiante.seccion', pensiones: 1 } },
            ], { session });
            const response = [];
            try {
                for (var _d = true, cursor_3 = __asyncValues(cursor), cursor_3_1; cursor_3_1 = yield cursor_3.next(), _a = cursor_3_1.done, !_a; _d = true) {
                    _c = cursor_3_1.value;
                    _d = false;
                    const doc = _c;
                    response.push(doc);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_3.return)) yield _b.call(cursor_3);
                }
                finally { if (e_8) throw e_8.error; }
            }
            return response;
        });
    }
    static pagarPensionByAlumnoIdAndMonth({ mora, nivel, year, alumnoId, fecha, mes, monto_abonado, monto_pagar, monto_pagado, issuer, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const pagadoCompletamente = monto_pagado + monto_abonado === monto_pagar ? true : false;
            const session = db_1.mongoClient.startSession();
            session.startTransaction();
            let reciboId = null;
            //si esta pagado completamente, creamos un recibo y incrementamos el correlativo de recibos
            if (pagadoCompletamente) {
                //fetch numero de recibo:
                const reciboNumberResponse = yield db_1.mongoClient.db().collection(`correlativos${year}`).findOne({ tipo: 'recibo' });
                let reciboNumber;
                if (!reciboNumberResponse) {
                    reciboNumber = 0;
                }
                else {
                    reciboNumber = reciboNumberResponse.current;
                }
                //crear recibo:
                const createReciboResponse = yield db_1.mongoClient
                    .db()
                    .collection(`recibos${year}`)
                    .insertOne({
                    numRecibo: reciboNumber + 1,
                    nivel,
                    alumnoId: new mongodb_1.ObjectId(alumnoId),
                    fecha,
                    operacion: nivel === 'inicial' ? 'PEI' : nivel === 'primaria' ? 'PEP' : 'PES',
                    detalles: {
                        issuer: new mongodb_1.ObjectId(issuer),
                        descripcion: `pensión ${asistencia_1.VALID_MONTHS[mes]}`,
                        montoPagado: monto_pagado + monto_abonado,
                        mora,
                    },
                }, { session });
                if (!createReciboResponse.insertedId || !createReciboResponse.acknowledged) {
                    yield session.abortTransaction();
                    session.endSession();
                    throw new Error('error procesando el pago');
                }
                reciboId = createReciboResponse.insertedId;
                //increase the current in the correlativos:
                const increaseCorrelativoResponse = yield db_1.mongoClient
                    .db()
                    .collection(`correlativos${year}`)
                    .updateOne({ tipo: 'recibo' }, { $set: { current: reciboNumber + 1 } }, { upsert: true, session });
                if (!increaseCorrelativoResponse.acknowledged) {
                    yield session.abortTransaction();
                    yield session.endSession();
                    throw new Error('error procesando el pago, incremento del correlativo');
                }
            }
            //actualizar pension record
            const updatePensionRecordResponse = yield db_1.mongoClient
                .db()
                .collection(`pensiones${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId), 'pensiones.mes': mes }, {
                $inc: { 'pensiones.$.monto_pagado': monto_abonado, numPensionesPagadas: pagadoCompletamente ? 1 : 0 },
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
