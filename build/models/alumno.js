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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alumno = void 0;
const db_1 = require("../db");
const mongodb_1 = require("mongodb");
const enums_1 = require("../error/enums");
const utils_1 = require("../utils/generarBoletaNotas/utils/utils");
class Alumno {
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
    static fetchAlumnosIdsByGradoSeccion({ nivel, year, grado, seccion }) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = yield db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .distinct('_id', { grado, seccion, estadoMatricula: { $in: ['DEFINITIVA', 'EN PROCESO', 'PENDIENTE'] } });
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
    static ratificarMatricula({ alumnos, currentYearCollectionName, lastYearCollectionName, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const alumnosNoId = alumnos.map((alumno) => {
                const { _id } = alumno, rest = __rest(alumno, ["_id"]);
                return Object.assign({}, rest);
            });
            const cantidadAlumnos = alumnos.length;
            const alumnosIds = alumnos.map((alumno) => new mongodb_1.ObjectId(alumno._id));
            const session = db_1.mongoClient.startSession();
            try {
                session.startTransaction();
                const response1 = yield db_1.mongoClient
                    .db()
                    .collection(currentYearCollectionName)
                    .insertMany([...alumnosNoId], { session });
                if (!response1.acknowledged || response1.insertedCount !== cantidadAlumnos) {
                    throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
                }
                const response2 = yield db_1.mongoClient
                    .db()
                    .collection(lastYearCollectionName)
                    .deleteMany({ _id: { $in: alumnosIds } });
                if (!response2.acknowledged || response2.deletedCount !== cantidadAlumnos) {
                    throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
                }
                session.commitTransaction();
                // for await(let alumno of alumnos){
                //   mongoClient.db().collection(lastYearCollectionName).deleteOne({_id:new ObjectId(alumno._id)})
                // }
            }
            catch (error) {
                yield session.abortTransaction();
                session.endSession();
            }
        });
    }
    static getByGradoSeccion({ grado, seccion, collectionName }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, e_5, _b, _c;
                let alumnos = [];
                const cursor = db_1.mongoClient.db().collection(collectionName).find({ grado, seccion });
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
    static nuevaMatricula({ alumno, nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .insertOne(Object.assign(Object.assign({}, alumno), { nombreCompleto: alumno.apellidos + ', ' + alumno.nombres, estadoMatricula: 'DEFINITIVA' }));
            return response;
        });
    }
    static fetchAlumnoByDni({ nivel, year, dni }) {
        return __awaiter(this, void 0, void 0, function* () {
            const alumno = yield db_1.mongoClient.db().collection(`matriculados${nivel}${year}`).findOne({ dni });
            return alumno;
        });
    }
}
exports.Alumno = Alumno;
