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
class Calendario {
    static getAsistenciaRecordPeriodo({ periodo, nivel, year, alumnosIds }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const periodoStart = (0, periodosDates_1.getPeriodoStartDate)(periodo);
            const periodoEnd = (0, periodosDates_1.getPeriodoEndDate)(periodo);
            const beginMonth = (0, periodosDates_1.convertNumberToMonthName)(new Date(periodoStart).getMonth());
            const beginDay = new Date(periodoStart).getDate();
            const lastMonth = (0, periodosDates_1.convertNumberToMonthName)(new Date(periodoEnd).getMonth());
            const lastDay = new Date(periodoEnd).getDate();
            const betweenMonths = [];
            for (let i = new Date(periodoStart).getMonth() + 1; i < new Date(periodoEnd).getMonth(); i++) {
                betweenMonths.push({ $eq: ['$$record.month', (0, periodosDates_1.convertNumberToMonthName)(i)] });
            }
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
                        },
                    },
                },
                { $sort: { nombreCompleto: 1 } },
            ]);
            const results = [];
            try {
                for (var _d = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _d = true) {
                    _c = cursor_1_1.value;
                    _d = false;
                    const record = _c;
                    results.push(record);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                }
                finally { if (e_1) throw e_1.error; }
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
            yield db_1.mongoClient
                .db()
                .collection('currentPeriodo')
                .updateOne({ nivel, year: Number(year) }, { $set: { periodo } }, { upsert: true });
        });
    }
    static fetchCurrentPeriodo({ nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection('currentPeriodo')
                .findOne({ nivel, year: Number(year) });
            return response;
        });
    }
    static fetchADayAsistenciaRecord({ nivel, year, alumnoId, dayId }) {
        var _a, e_2, _b, _c;
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
                for (var _d = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _a = cursor_2_1.done, !_a; _d = true) {
                    _c = cursor_2_1.value;
                    _d = false;
                    let doc = _c;
                    results.push(doc);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_2.return)) yield _b.call(cursor_2);
                }
                finally { if (e_2) throw e_2.error; }
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
        var _a, e_3, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient.db().collection(`calendario${nivel}${year}`).find({}).sort('month', 1);
            const documents = [];
            try {
                for (var _d = true, cursor_3 = __asyncValues(cursor), cursor_3_1; cursor_3_1 = yield cursor_3.next(), _a = cursor_3_1.done, !_a; _d = true) {
                    _c = cursor_3_1.value;
                    _d = false;
                    let doc = _c;
                    documents.push(doc);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_3.return)) yield _b.call(cursor_3);
                }
                finally { if (e_3) throw e_3.error; }
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
}
exports.default = Calendario;
