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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alumno = void 0;
const db_1 = require("../db");
const mongodb_1 = require("mongodb");
const enums_1 = require("../error/enums");
const utils_1 = require("../utils/generarBoletaNotas/utils/utils");
const Calendario_1 = __importDefault(require("./Calendario"));
const periodosDates_1 = require("../vars/periodosDates");
class Alumno {
    static ProcesoNuevoMatricula({ nivel, year, alumno }) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = db_1.mongoClient.startSession();
            session.startTransaction();
            try {
                const matriculaResult = yield this.nuevaMatricula({ alumno, nivel, year, session });
                if (!matriculaResult.acknowledged || !matriculaResult.insertedId) {
                    yield session.abortTransaction();
                    yield session.endSession();
                    return false;
                }
                const lastDayFromCalendar = yield Calendario_1.default.fetchLastDayOfCalendarioEscolar({ nivel, year });
                if (!lastDayFromCalendar) {
                    yield session.abortTransaction();
                    yield session.endSession();
                    return false;
                }
                const lastDate = new Date(`${year}-${(0, periodosDates_1.parseMonthNameToMonthNumber1to12)(lastDayFromCalendar.month)}-${lastDayFromCalendar.day}`);
                //insertar asistencia records de acuerdo a la fecha de la mtricula
                const fechaMatricula = new Date(alumno.fechaMatricula);
                const calendarioDaysForMatricula = yield Calendario_1.default.getCalendarioDaysRange({ nivel, year, startDate: fechaMatricula, endDate: lastDate });
                //insertar nuevo record en asistencias{nivel}{year}
                const alumnoAsistenciaRecords = calendarioDaysForMatricula.map((element) => {
                    return { dayId: element._id, day: element.day, month: element.month, asistencia: '', modified: '' };
                });
                const result2 = yield Calendario_1.default.insertNewMatriculaRecordAsistenciaEscolar({ nivel, year, alumnoId: matriculaResult.insertedId, records: alumnoAsistenciaRecords });
                if (!result2.acknowledged) {
                    yield session.abortTransaction();
                    yield session.endSession();
                    return false;
                }
                //insertar pensiones de acuerdo a la fecha de matricula
                const pensiones = [];
                for (let i = fechaMatricula.getMonth(); i <= 11; i++) {
                    const record = { fecha: '', monto_pagar: nivel === 'primaria' ? 170 : 160, monto_pagado: 0, mes: i, pagado: false };
                    pensiones.push(record);
                }
                const pensionesResponse = yield db_1.mongoClient
                    .db()
                    .collection(`pensiones${nivel}${year}`)
                    .insertOne({ numPensionesPagadas: 0, alumnoId: matriculaResult.insertedId, pensiones }, { session });
                if (!pensionesResponse.acknowledged || !pensionesResponse.insertedId) {
                    yield session.abortTransaction();
                    yield session.endSession();
                    return false;
                }
                yield session.commitTransaction();
                yield session.endSession();
                return true;
            }
            catch (error) {
                yield session.abortTransaction();
                yield session.endSession();
                return false;
            }
        });
    }
    static fetchAsistenciaList({ grado, seccion, nivel, year, month, dayId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const asistenciasCollection = `asistencias${nivel}${year}`;
            const matriculadosCollection = `matriculados${nivel}${year}`;
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, e_1, _b, _c;
                let asistenciaList = [];
                const cursor = db_1.mongoClient
                    .db()
                    .collection(matriculadosCollection)
                    .aggregate([
                    { $match: { grado, seccion, estadoMatricula: { $in: ['DEFINITIVA', 'EN PROCESO'] } } },
                    { $lookup: { from: asistenciasCollection, localField: '_id', foreignField: 'alumnoId', as: 'asistencia' } },
                    { $project: { nombreCompleto: 1, _id: 0, recordAsistencia: { $arrayElemAt: ['$asistencia', 0] } } },
                    { $project: { nombreCompleto: 1, alumnoId: '$recordAsistencia.alumnoId', records: `$recordAsistencia.records` } },
                    { $project: { nombreCompleto: 1, alumnoId: 1, records: { $filter: { input: '$records', as: 'records', cond: { $eq: ['$$records.dayId', new mongodb_1.ObjectId(dayId)] } } } } },
                    { $project: { nombreCompleto: 1, alumnoId: 1, asistencia: { $arrayElemAt: ['$records', 0] } } },
                    { $project: { alumnoId: 1, nombreCompleto: 1, asistencia: '$asistencia.asistencia' } },
                    { $sort: { nombreCompleto: 1 } },
                ]);
                try {
                    for (var _d = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _d = true) {
                        _c = cursor_1_1.value;
                        _d = false;
                        let doc = _c;
                        asistenciaList.push(doc);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                resolve({ asistenciaList, dayId, month });
            }));
        });
    }
    static increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId, periodo, quantity, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $inc: { [`inasistencias.justificadas.${(0, utils_1.convertPeriodoKeyToIndex)(periodo)}`]: quantity } });
            return response;
        });
    }
    static increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId, periodo, quantity, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $inc: { [`inasistencias.injustificadas.${(0, utils_1.convertPeriodoKeyToIndex)(periodo)}`]: quantity } });
            return response;
        });
    }
    static increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId, periodo, quantity, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $inc: { [`tardanzas.injustificadas.${(0, utils_1.convertPeriodoKeyToIndex)(periodo)}`]: quantity } });
            return response;
        });
    }
    // static async updateAsistenciaList({ nivel, year, asistenciaList }: { nivel: Nivel; year: Year; asistenciaList: AsistenciaList }) {
    //   const { list, dayId, periodo } = asistenciaList
    //   console.log({ list, dayId, periodo })
    //   const asistenciasCollection = mongoClient.db().collection(`asistencias${nivel}${year}`)
    //   list.forEach(async (record) => {
    //     //only process F and A values, ingore T because they dont have to be addressed here.
    //     if (record.asistencia === 'F') {
    //       //increase inasistencias.injustificadas by 1 in "notas collection"
    //       const key = `inasistencias.injustificadas.${convertPeriodoKeyToIndex(periodo)}`
    //       await mongoClient
    //         .db()
    //         .collection(`notas${nivel}${year}`)
    //         .updateOne({ alumnoId: new ObjectId(record.alumnoId) }, { $inc: { [key]: 1 } })
    //     }
    //     /////
    //     if (record.asistencia !== 'T') {
    //       await asistenciasCollection.updateOne(
    //         { alumnoId: new ObjectId(record.alumnoId) },
    //         { $set: { 'records.$[element].asistencia': record.asistencia } },
    //         { arrayFilters: [{ 'element.dayId': new ObjectId(dayId) }] },
    //       )
    //     }
    //   })
    // }
    static fetchAlumnosIdsByGradoSeccion({ nivel, year, grado, seccion, estadoMatricula, }) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = yield db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .distinct('_id', { grado, seccion, estadoMatricula: { $in: estadoMatricula ? [...estadoMatricula] : ['DEFINITIVA', 'EN PROCESO', 'PENDIENTE'] } });
            const records = [];
            try {
                for (var _d = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _a = cursor_2_1.done, !_a; _d = true) {
                    _c = cursor_2_1.value;
                    _d = false;
                    const doc = _c;
                    records.push(doc);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_2.return)) yield _b.call(cursor_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return records;
        });
    }
    static editarAlumno({ alumno, collectionName }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id } = alumno, data = __rest(alumno, ["_id"]);
            const response = yield db_1.mongoClient
                .db()
                .collection(collectionName)
                .updateOne({ _id: new mongodb_1.ObjectId(_id) }, { $set: Object.assign({}, data) });
            return response.acknowledged;
        });
    }
    //busca alumnos con estado de matricula no "TRASLADADO"
    static buscarAlumno({ nombreCompleto, collectionName, estadosMatricula, }) {
        var _a, e_3, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let alumnos = [];
            const cursor = db_1.mongoClient
                .db()
                .collection(collectionName)
                .find({ $text: { $search: nombreCompleto }, estadoMatricula: { $in: [...estadosMatricula] } }, { sort: { grado: -1 } });
            try {
                for (var _d = true, cursor_3 = __asyncValues(cursor), cursor_3_1; cursor_3_1 = yield cursor_3.next(), _a = cursor_3_1.done, !_a; _d = true) {
                    _c = cursor_3_1.value;
                    _d = false;
                    let doc = _c;
                    alumnos.push(doc);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_3.return)) yield _b.call(cursor_3);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return alumnos;
        });
    }
    static retirarAlumno({ _id, fechaRetiro, collectionName }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(collectionName)
                .updateOne({ _id, estadoMatricula: { $in: ['DEFINITIVA', 'PENDIENTE'] } }, { $set: { estadoMatricula: 'TRASLADADO', fechaRetiro } });
            return response.modifiedCount;
        });
    }
    static getRatificarList({ grado, seccion, collectionName }) {
        var _a, e_4, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient.db().collection(collectionName).find({ grado, seccion, estadoMatricula: 'DEFINITIVA' });
            const alumnos = [];
            try {
                for (var _d = true, cursor_4 = __asyncValues(cursor), cursor_4_1; cursor_4_1 = yield cursor_4.next(), _a = cursor_4_1.done, !_a; _d = true) {
                    _c = cursor_4_1.value;
                    _d = false;
                    let alumno = _c;
                    alumnos.push(alumno);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_4.return)) yield _b.call(cursor_4);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return alumnos;
        });
    }
    static ratificarMatricula({ alumnos, sourceNivel, targetNivel, currentYear, lastYear, fechaMatricula, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const alumnosNoId = alumnos.map((alumno) => {
                const { _id } = alumno, rest = __rest(alumno, ["_id"]);
                return Object.assign({}, rest);
            });
            const cantidadAlumnos = alumnos.length;
            const oldAlumnosIds = alumnos.map((alumno) => new mongodb_1.ObjectId(alumno._id)); //old ids
            const session = db_1.mongoClient.startSession();
            session.startTransaction();
            //matricular en el año presente:
            const matriculaResult = yield db_1.mongoClient
                .db()
                .collection(`matriculados${targetNivel}${currentYear}`)
                .insertMany([...alumnosNoId], { session });
            if (!matriculaResult.acknowledged || matriculaResult.insertedCount !== cantidadAlumnos) {
                yield session.abortTransaction();
                yield session.endSession();
                throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
            }
            const newAlumnosIds = Object.values(matriculaResult.insertedIds);
            //borrar de la lista ratificar del año pasado
            const deleteResult = yield db_1.mongoClient
                .db()
                .collection(`ratificar${sourceNivel}${lastYear}`)
                .deleteMany({ _id: { $in: oldAlumnosIds } });
            if (!deleteResult.acknowledged || deleteResult.deletedCount !== cantidadAlumnos) {
                yield session.abortTransaction();
                yield session.endSession();
                throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
            }
            //asistencia:
            let alumnoAsistenciaRecords = [];
            const lastDayFromCalendar = yield Calendario_1.default.fetchLastDayOfCalendarioEscolar({ nivel: targetNivel, year: currentYear });
            // if (!lastDayFromCalendar) {
            //   await session.abortTransaction()
            //   await session.endSession()
            // }
            if (lastDayFromCalendar != null) {
                const lastDate = new Date(`${currentYear}-${(0, periodosDates_1.parseMonthNameToMonthNumber1to12)(lastDayFromCalendar.month)}-${lastDayFromCalendar.day}`);
                const calendarioDaysForMatricula = yield Calendario_1.default.getCalendarioDaysRange({ nivel: targetNivel, year: currentYear, startDate: fechaMatricula, endDate: lastDate });
                alumnoAsistenciaRecords = calendarioDaysForMatricula.map((element) => {
                    return { dayId: element._id, day: element.day, month: element.month, asistencia: '', modified: '' };
                });
            }
            const recordsAsistencia = newAlumnosIds.map((alumnoId) => {
                return { alumnoId, records: alumnoAsistenciaRecords };
            });
            const asistenciasResponse = yield Calendario_1.default.insertManyAlumnoAsistenciaRecord({ nivel: targetNivel, year: currentYear, recordsAsistencia, session });
            if (asistenciasResponse.insertedCount != cantidadAlumnos) {
                yield session.abortTransaction();
                yield session.endSession();
                throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
            }
            //notas: manejado por un trigger de la base de datos
            //pensiones
            const pensiones = [];
            for (let i = fechaMatricula.getMonth(); i <= 11; i++) {
                const record = { fecha: '', monto_pagar: targetNivel === 'primaria' ? 170 : 160, monto_pagado: 0, mes: i, pagado: false };
                pensiones.push(record);
            }
            const recordsPensiones = newAlumnosIds.map((alumnoId) => {
                return { alumnoId, pensiones, numPensionesPagadas: 0 };
            });
            const pensionesResponse = yield db_1.mongoClient
                .db()
                .collection(`pensiones${targetNivel}${currentYear}`)
                .insertMany([...recordsPensiones], { session });
            if (pensionesResponse.insertedCount != cantidadAlumnos) {
                yield session.abortTransaction();
                yield session.endSession();
                throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
            }
            yield session.commitTransaction();
            yield session.endSession();
        });
    }
    static getByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, e_5, _b, _c;
                let alumnos = [];
                const cursor = db_1.mongoClient
                    .db()
                    .collection(`matriculados${nivel}${year}`)
                    .find({ grado, seccion, estadoMatricula: { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] } });
                try {
                    for (var _d = true, cursor_5 = __asyncValues(cursor), cursor_5_1; cursor_5_1 = yield cursor_5.next(), _a = cursor_5_1.done, !_a; _d = true) {
                        _c = cursor_5_1.value;
                        _d = false;
                        const doc = _c;
                        alumnos.push(doc);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = cursor_5.return)) yield _b.call(cursor_5);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                resolve(alumnos);
            }));
        });
    }
    static nuevaMatricula({ alumno, nivel, year, session }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .insertOne(Object.assign(Object.assign({}, alumno), { nombreCompleto: alumno.apellidos + ', ' + alumno.nombres, estadoMatricula: 'DEFINITIVA' }), { session: session ? session : undefined });
            return response;
        });
    }
    static fetchAlumnoByDni({ nivel, year, dni }) {
        return __awaiter(this, void 0, void 0, function* () {
            const alumno = yield db_1.mongoClient.db().collection(`matriculados${nivel}${year}`).findOne({ dni });
            return alumno;
        });
    }
    static fetchAlumnoByGradoSeccionApellidos({ nivel, year, apellidos, grado, seccion }) {
        return __awaiter(this, void 0, void 0, function* () {
            const alumno = yield db_1.mongoClient.db().collection(`matriculados${nivel}${year}`).findOne({ apellidos, grado, seccion });
            return alumno;
        });
    }
    static fetchAlumnoByCodigoEstudiante({ nivel, year, codigoEstudiante }) {
        return __awaiter(this, void 0, void 0, function* () {
            const alumno = yield db_1.mongoClient.db().collection(`matriculados${nivel}${year}`).findOne({ codigoEstudiante });
            return alumno;
        });
    }
    static getById({ nivel, year, id }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .findOne({ _id: new mongodb_1.ObjectId(id) });
            return response;
        });
    }
}
exports.Alumno = Alumno;
