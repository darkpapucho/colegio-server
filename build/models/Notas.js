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
class Notas {
    static updateCursosFieldsByAlumnosId({ 
    //actualiza los campos de los cursos a evaluar por salon en notas$[nivel}${year}
    alumnosId, cursosKey, session, nivel, year, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const cursos = Object.fromEntries(cursosKey.map((curso) => [curso, [0, 0, 0, 0]]));
            const response = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .updateMany({ alumnoId: { $in: [...alumnosId] } }, { $set: { cursos } }, { session });
            return response;
        });
    }
    static getNotasByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula, }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .aggregate([
                { $match: { grado, seccion, estadoMatricula: { $in: estadosMatricula ? estadosMatricula : ['DEFINITIVA', 'EN PROCESO'] } } },
                { $project: { alumno: '$nombreCompleto', _id: 1, estadoMatricula: 1 } },
                { $lookup: { from: `notas${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'record' } },
                { $project: { alumno: 1, estadoMatricula: 1, record: { $arrayElemAt: ['$record', 0] } } },
                {
                    $project: {
                        _id: 0,
                        alumno: 1,
                        estadoMatricula: 1,
                        alumnoId: '$record.alumnoId',
                        tardanzas: '$record.tardanzas',
                        inasistencias: '$record.inasistencias',
                        conclusionesDescriptivas: '$record.conclusionesDescriptivas',
                        cursos: '$record.cursos',
                        conducta: '$record.conducta',
                        conductaPPFF: '$record.conductaPPFF',
                    },
                },
                { $sort: { alumno: 1 } },
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
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        });
    }
    static getNotasByGradoSeccionFromCursosProfesor({ nivel, year, grado, seccion, estadosMatricula, isTutor, cursosQuery, }) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`matriculados${nivel}${year}`)
                .aggregate([
                { $match: { grado, seccion, estadoMatricula: { $in: estadosMatricula ? estadosMatricula : ['DEFINITIVA', 'EN PROCESO'] } } },
                { $project: { alumno: '$nombreCompleto', _id: 1, estadoMatricula: 1 } },
                { $lookup: { from: `notas${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'record' } },
                { $project: { alumno: 1, estadoMatricula: 1, record: { $arrayElemAt: ['$record', 0] } } },
                {
                    $project: {
                        _id: 0,
                        alumno: 1,
                        estadoMatricula: 1,
                        alumnoId: '$record.alumnoId',
                        tardanzas: '$record.tardanzas',
                        inasistencias: '$record.inasistencias',
                        conclusionesDescriptivas: '$record.conclusionesDescriptivas',
                        conducta: '$record.conducta',
                        conductaPPFF: '$record.conductaPPFF',
                        cursos: '$record.cursos',
                    },
                },
                {
                    $project: {
                        alumno: 1,
                        estadosMatricula: 1,
                        alumnoId: 1,
                        tardanzas: isTutor ? 1 : 0,
                        inasistencias: isTutor ? 1 : 0,
                        conclusionesDescriptivas: isTutor ? 1 : 0,
                        conducta: isTutor ? 1 : 0,
                        conductaPPFF: isTutor ? 1 : 0,
                        cursos: cursosQuery,
                    },
                },
                { $sort: { alumno: 1 } },
            ]);
            const result = [];
            try {
                for (var _d = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _a = cursor_2_1.done, !_a; _d = true) {
                    _c = cursor_2_1.value;
                    _d = false;
                    const doc = _c;
                    result.push(doc);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_2.return)) yield _b.call(cursor_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        });
    }
    static updateRecordNotasByTeacher({ nivel, year, registro, isTutor, cursosProfesor, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .bulkWrite(registro.map((row) => {
                const cursosQuery = Object.fromEntries(cursosProfesor.map((cursoSalon) => {
                    const notas = row.cursos[cursoSalon.key];
                    return [`cursos.${cursoSalon.key}`, notas];
                }));
                const tutorQuery = {};
                if (isTutor) {
                    tutorQuery['inasistencias'] = row.inasistencias;
                    tutorQuery['tardanzas'] = row.tardanzas;
                    tutorQuery['conducta'] = row.conducta;
                    tutorQuery['conductaPPFF'] = row.conductaPPFF;
                    tutorQuery['conclusionesDescriptivas'] = row.conclusionesDescriptivas;
                }
                return {
                    updateOne: {
                        filter: { alumnoId: new mongodb_1.ObjectId(row.alumnoId) },
                        update: {
                            $set: Object.assign(Object.assign({}, tutorQuery), cursosQuery),
                        },
                    },
                };
            }), { ordered: false });
            return response;
        });
    }
    static updateRecordNotasPrimaria({ nivel, year, registro }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .bulkWrite(registro.map((row) => {
                const cursosQuery = Object.fromEntries(Object.keys(row.cursos).map((cursoKey) => {
                    const notas = row.cursos[cursoKey];
                    return [`cursos.${cursoKey}`, notas];
                }));
                return {
                    updateOne: {
                        filter: { alumnoId: new mongodb_1.ObjectId(row.alumnoId) },
                        update: {
                            $set: Object.assign({ inasistencias: row.inasistencias, tardanzas: row.tardanzas, conducta: row.conducta, conductaPPFF: row.conductaPPFF, conclusionesDescriptivas: row.conclusionesDescriptivas }, cursosQuery),
                        },
                    },
                };
            }), { ordered: false });
            return response;
        });
    }
}
exports.default = Notas;
