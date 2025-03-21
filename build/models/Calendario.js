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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
const enums_1 = require("../error/enums");
const utils_1 = require("../utils/generarBoletaNotas/utils/utils");
const convertDateToPeriodo_1 = __importDefault(require("../utils/convertDateToPeriodo"));
const periodosDates_1 = require("../vars/periodosDates");
const calendario_1 = require("../utils/calendario");
class Calendario {
    static fetchAsistenciaListByDayIdAndValue({ nivel, year, dayId, asistenciaValue }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .aggregate([
                { $match: {} },
                {
                    $project: {
                        alumnoId: 1,
                        records: { $filter: { input: '$records', as: 'records', cond: { $and: [{ $eq: ['$$records.dayId', new mongodb_1.ObjectId(dayId)] }, { $eq: ['$$records.asistencia', asistenciaValue] }] } } },
                    },
                },
                { $match: { $expr: { $gt: [{ $size: '$records' }, 0] } } },
                { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
                { $project: { estudiante: { $arrayElemAt: ['$estudiante', 0] }, records: 1 } },
                { $project: { _id: '$estudiante._id', nombreCompleto: '$estudiante.nombreCompleto', grado: '$estudiante.grado', seccion: '$estudiante.seccion', records: 1 } },
            ]);
            const list = [];
            try {
                for (var _d = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _d = true) {
                    _c = cursor_1_1.value;
                    _d = false;
                    const doc = _c;
                    list.push(doc);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return list;
        });
    }
    static getAvailableDaysFromCalendarioByPeriodo({ nivel, year, periodo }) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const periodoStart = (0, periodosDates_1.getPeriodoStartDate)(periodo);
            const periodoEnd = (0, periodosDates_1.getPeriodoEndDate)(periodo);
            const beginMonth = (0, periodosDates_1.convertNumberToMonthName)(new Date(periodoStart).getMonth());
            const beginDay = new Date(periodoStart).getDate();
            const lastMonth = (0, periodosDates_1.convertNumberToMonthName)(new Date(periodoEnd).getMonth());
            const lastDay = new Date(periodoEnd).getDate();
            const betweenMonths = [];
            for (let i = new Date(periodoStart).getMonth() + 1; i < new Date(periodoEnd).getMonth(); i++) {
                betweenMonths.push({ month: (0, periodosDates_1.convertNumberToMonthName)(i) });
            }
            const cursor = db_1.mongoClient
                .db()
                .collection(`calendario${nivel}${year}`)
                .aggregate([
                {
                    $match: {
                        $or: [{ $and: [{ month: beginMonth }, { day: { $gte: beginDay } }] }, ...betweenMonths, { $and: [{ month: lastMonth }, { day: { $lte: lastDay } }] }],
                    },
                },
            ]);
            const availableDays = [];
            try {
                for (var _d = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _a = cursor_2_1.done, !_a; _d = true) {
                    _c = cursor_2_1.value;
                    _d = false;
                    const doc = _c;
                    availableDays.push(doc);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_2.return)) yield _b.call(cursor_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return availableDays;
        });
    }
    static insertNewMatriculaRecordAsistenciaEscolar({ nivel, year, records, alumnoId, session }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .insertOne({ alumnoId, records }, { session: session ? session : undefined });
            return result;
        });
    }
    static fetchLastDayOfCalendarioEscolar({ nivel, year }) {
        var _a, e_3, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const results = db_1.mongoClient.db().collection(`calendario${nivel}${year}`).find({});
            const monthsRecorded = [];
            const records = [];
            try {
                for (var _d = true, results_1 = __asyncValues(results), results_1_1; results_1_1 = yield results_1.next(), _a = results_1_1.done, !_a; _d = true) {
                    _c = results_1_1.value;
                    _d = false;
                    const result = _c;
                    records.push(result);
                    const monthIndex = calendario_1.MONTHS_YEAR.findIndex((element) => element === result.month);
                    if (!monthsRecorded.includes(monthIndex)) {
                        monthsRecorded.push(monthIndex);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = results_1.return)) yield _b.call(results_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            const maxMonth = (0, periodosDates_1.convertNumberToMonthName)(monthsRecorded.sort((prev, curr) => (curr > prev ? 1 : -1))[0]);
            const recordsFromMaxMonth = records.filter((elem) => elem.month === maxMonth).sort((prev, curr) => (prev.day < curr.day ? 1 : -1));
            return recordsFromMaxMonth[0];
        });
    }
    static getCalendarioDaysForNewMatricula({ nivel, year, fechaMatricula, lastDate }) {
        var _a, e_4, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const beginMonth = (0, periodosDates_1.convertNumberToMonthName)(fechaMatricula.getMonth());
            const beginDay = fechaMatricula.getDate();
            const lastMonth = (0, periodosDates_1.convertNumberToMonthName)(lastDate.getMonth());
            const lastDay = lastDate.getDate();
            const betweenMonths = [];
            for (let i = fechaMatricula.getMonth() + 1; i < lastDate.getMonth(); i++) {
                betweenMonths.push({ month: (0, periodosDates_1.convertNumberToMonthName)(i) });
            }
            let results = null;
            if (lastMonth == beginMonth) {
                results = db_1.mongoClient
                    .db()
                    .collection(`calendario${nivel}${year}`)
                    .aggregate([
                    {
                        $match: {
                            $and: [{ $and: [{ month: beginMonth }, { day: { $gte: beginDay } }] }, { $and: [{ month: lastMonth }, { day: { $lte: lastDay } }] }],
                        },
                    },
                ]);
            }
            else {
                results = db_1.mongoClient
                    .db()
                    .collection(`calendario${nivel}${year}`)
                    .aggregate([
                    {
                        $match: {
                            $or: [{ $and: [{ month: beginMonth }, { day: { $gte: beginDay } }] }, ...betweenMonths, { $and: [{ month: lastMonth }, { day: { $lte: lastDay } }] }],
                        },
                    },
                ]);
            }
            const calendarioDays = [];
            try {
                for (var _d = true, _e = __asyncValues(results), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const result = _c;
                    calendarioDays.push(result);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return calendarioDays;
        });
    }
    static getAsistenciaDayStatus({ alumnoId, dayId, nivel, year }) {
        var _a, e_5, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const result = db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .aggregate([
                { $match: { alumnoId: new mongodb_1.ObjectId(alumnoId) } },
                {
                    $project: {
                        record: {
                            $filter: {
                                input: '$records',
                                as: 'records',
                                cond: { $eq: ['$$records.dayId', new mongodb_1.ObjectId(dayId)] },
                            },
                        },
                    },
                },
                { $project: { _id: 0, record: { $arrayElemAt: ['$record', 0] } } },
            ]);
            const results = [];
            try {
                for (var _d = true, result_1 = __asyncValues(result), result_1_1; result_1_1 = yield result_1.next(), _a = result_1_1.done, !_a; _d = true) {
                    _c = result_1_1.value;
                    _d = false;
                    const record = _c;
                    results.push(record);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = result_1.return)) yield _b.call(result_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            return results[0];
        });
    }
    static justificarFalta({ nivel, year, dayId, alumnoId, periodo }) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = db_1.mongoClient.startSession();
            session.startTransaction();
            const result = yield db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId), 'records.dayId': new mongodb_1.ObjectId(dayId) }, { $set: { 'records.$.justificado': true } });
            if (!result.acknowledged || !result.modifiedCount) {
                yield session.abortTransaction();
                yield session.endSession();
                throw new Error(enums_1.ErrorMessages.DATA_BASE_ERROR);
            }
            const result2 = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $inc: { [`inasistencias.injustificadas.${(0, utils_1.convertPeriodoKeyToIndex)(periodo)}`]: -1, [`inasistencias.justificadas.${(0, utils_1.convertPeriodoKeyToIndex)(periodo)}`]: 1 } });
            if (!result2.acknowledged || !result2.modifiedCount) {
                yield session.abortTransaction();
                yield session.endSession();
                throw new Error(enums_1.ErrorMessages.DATA_BASE_ERROR);
            }
            yield session.commitTransaction();
            yield session.endSession();
        });
    }
    static getAsistenciaRecordPeriodo({ periodo, nivel, year, alumnosIds }) {
        var _a, e_6, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const periodoStart = (0, periodosDates_1.getPeriodoStartDate)(periodo);
            const periodoEnd = (0, periodosDates_1.getPeriodoEndDate)(periodo);
            const beginMonth = (0, periodosDates_1.convertNumberToMonthName)(new Date(periodoStart).getMonth());
            const beginDay = new Date(periodoStart).getDate();
            const lastMonth = (0, periodosDates_1.convertNumberToMonthName)(new Date(periodoEnd).getMonth());
            const lastDay = new Date(periodoEnd).getDate();
            const betweenMonths = (0, calendario_1.getMonthsBetween)(new Date(periodoStart), new Date(periodoEnd), '$$record.month');
            // for (let i = new Date(periodoStart).getMonth() + 1; i < new Date(periodoEnd).getMonth(); i++) {
            //   betweenMonths.push({ $eq: ['$$record.month', convertNumberToMonthName(i)] })
            // }
            const cursor = db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .aggregate([
                { $match: { alumnoId: { $in: [...alumnosIds] } } },
                { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
                {
                    $project: {
                        _id: 0,
                        alumno: { $arrayElemAt: ['$estudiante', 0] },
                        alumnoId: 1,
                        records: {
                            $filter: {
                                input: '$records',
                                as: 'record',
                                cond: {
                                    $or: [
                                        {
                                            $and: [{ $eq: ['$$record.month', beginMonth] }, { $gte: ['$$record.day', beginDay] }],
                                        },
                                        ...betweenMonths,
                                        {
                                            $and: [{ $eq: ['$$record.month', lastMonth] }, { $lte: ['$$record.day', lastDay] }],
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        nombreCompleto: '$alumno.nombreCompleto',
                        alumnoId: 1,
                        records: {
                            day: 1,
                            month: 1,
                            asistencia: 1,
                            dayId: 1,
                            justificado: 1,
                        },
                    },
                },
                { $sort: { nombreCompleto: 1 } },
            ]);
            const results = [];
            try {
                for (var _d = true, cursor_3 = __asyncValues(cursor), cursor_3_1; cursor_3_1 = yield cursor_3.next(), _a = cursor_3_1.done, !_a; _d = true) {
                    _c = cursor_3_1.value;
                    _d = false;
                    const record = _c;
                    results.push(record);
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_3.return)) yield _b.call(cursor_3);
                }
                finally { if (e_6) throw e_6.error; }
            }
            return results;
        });
    }
    static setAsistenciaAlumnoDay({ nivel, year, alumnoId, dayId, asistencia }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $set: { 'records.$[element].asistencia': asistencia } }, { arrayFilters: [{ 'element.dayId': new mongodb_1.ObjectId(dayId) }] });
            return response;
        });
    }
    static setCurrentPeriodo({ nivel, year, periodo }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient.db().collection('currentPeriodo').updateOne({ nivel, year }, { $set: { periodo } }, { upsert: true });
            return response;
        });
    }
    static fetchCurrentPeriodo({ nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient.db().collection('currentPeriodo').findOne({ nivel, year: year });
            return response;
        });
    }
    static fetchADayAsistenciaRecord({ nivel, year, alumnoId, dayId }) {
        var _a, e_7, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .aggregate([
                { $match: { alumnoId: new mongodb_1.ObjectId(alumnoId) } },
                { $unwind: { path: '$records' } },
                { $match: { 'records.dayId': new mongodb_1.ObjectId(dayId) } },
            ]);
            const results = [];
            try {
                for (var _d = true, cursor_4 = __asyncValues(cursor), cursor_4_1; cursor_4_1 = yield cursor_4.next(), _a = cursor_4_1.done, !_a; _d = true) {
                    _c = cursor_4_1.value;
                    _d = false;
                    let doc = _c;
                    results.push(doc);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_4.return)) yield _b.call(cursor_4);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return results;
        });
    }
    static fetchDayId({ day, month, nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.mongoClient
                .db()
                .collection(`calendario${nivel}${year}`)
                .findOne({ day, month }, { projection: { _id: 1 } });
        });
    }
    static reportTardanzaAlumno({ nivel, year, alumnoId, dayId, issuer }) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = db_1.mongoClient.startSession();
            session.startTransaction();
            const response1 = yield db_1.mongoClient
                .db()
                .collection(`asistencias${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId), 'records.dayId': new mongodb_1.ObjectId(dayId) }, { $set: { 'records.$.asistencia': 'T', 'records.$.issuer': new mongodb_1.ObjectId(issuer), 'records.$.modified': new Date() } });
            if (!response1.acknowledged || !response1.modifiedCount) {
                yield session.abortTransaction();
                session.endSession();
                throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
            }
            const response2 = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $inc: { [`tardanzas.injustificadas.${(0, utils_1.convertPeriodoKeyToIndex)((0, convertDateToPeriodo_1.default)(new Date()))}`]: 1 } });
            if (!response2.acknowledged || !response2.modifiedCount) {
                yield session.abortTransaction();
                session.endSession();
                throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
            }
            yield session.commitTransaction();
            session.endSession();
        });
    }
    static deleteDayFromCalendar({ nivel, year, dayId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`calendario${nivel}${year}`)
                .deleteOne({ _id: new mongodb_1.ObjectId(dayId) });
            return response;
        });
    }
    static fetchCalendario({ nivel, year }) {
        var _a, e_8, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient.db().collection(`calendario${nivel}${year}`).find({}).sort('month', 1);
            const documents = [];
            try {
                for (var _d = true, cursor_5 = __asyncValues(cursor), cursor_5_1; cursor_5_1 = yield cursor_5.next(), _a = cursor_5_1.done, !_a; _d = true) {
                    _c = cursor_5_1.value;
                    _d = false;
                    let doc = _c;
                    documents.push(doc);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_5.return)) yield _b.call(cursor_5);
                }
                finally { if (e_8) throw e_8.error; }
            }
            return documents;
        });
    }
    static checkSalonDayStatus({ dayId, nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = db_1.mongoClient.db().collection(`calendario${nivel}${year}`);
            const response = yield collection.findOne({ _id: new mongodb_1.ObjectId(dayId) }, { projection: { status: 1 } });
            return response;
        });
    }
    static checkSalonDayStatusByMonthDay({ nivel, year, day, month }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.mongoClient.db().collection(`calendario${nivel}${year}`).findOne({ day, month });
        });
    }
    static enableCalendarDays({ nivel, year, daysList }) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = db_1.mongoClient.db().collection(`calendario${nivel}${year}`);
            const currentTime = new Date();
            const modifiedList = daysList.map((record) => {
                return Object.assign(Object.assign({}, record), { status: 'disabled', createdAt: currentTime }); //removed salones:[]
            });
            modifiedList.forEach((record) => __awaiter(this, void 0, void 0, function* () {
                yield collection.updateOne({ month: record.month, day: record.day }, { $set: Object.assign({}, record) }, { upsert: true });
            }));
        });
    }
    static fetchAsistenciaListByGradoSeccionDayId({ nivel, year, grado, seccion, dayId, estadosMatricula, }) {
        var _a, e_9, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .aggregate([
                { $match: { grado, seccion, estadoMatricula: { $in: [...estadosMatricula] } } },
                { $lookup: { from: `asistencias${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'estudiante' } },
                { $project: { _id: 0, nombreCompleto: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } } },
                { $project: { nombreCompleto: 1, alumnoId: '$estudiante.alumnoId', asistencia: '$estudiante.records' } },
                {
                    $project: {
                        nombreCompleto: 1,
                        alumnoId: 1,
                        asistencia: {
                            $filter: {
                                input: '$asistencia',
                                as: 'asistencia',
                                cond: { $eq: ['$$asistencia.dayId', new mongodb_1.ObjectId(dayId)] },
                            },
                        },
                    },
                },
                { $project: { nombreCompleto: 1, alumnoId: 1, asistencia: { $arrayElemAt: ['$asistencia', 0] } } },
                { $project: { nombreCompleto: 1, alumnoId: 1, asistencia: '$asistencia.asistencia' } },
                { $sort: { nombreCompleto: 1 } },
            ]);
            const result = [];
            try {
                for (var _d = true, cursor_6 = __asyncValues(cursor), cursor_6_1; cursor_6_1 = yield cursor_6.next(), _a = cursor_6_1.done, !_a; _d = true) {
                    _c = cursor_6_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_6.return)) yield _b.call(cursor_6);
                }
                finally { if (e_9) throw e_9.error; }
            }
            return result;
        });
    }
}
exports.default = Calendario;
