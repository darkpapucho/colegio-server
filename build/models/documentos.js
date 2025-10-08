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
class Documento {
    static updateRegistroNotasProfesor({ nivel, year, isTutor, registro }) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = db_1.mongoClient.db().collection(`notas${nivel}${year}`);
            if (isTutor) {
                for (const record of registro) {
                    const { tardanzas, inasistencias, conclusionesDescriptivas, cursos } = record;
                    const cursosKeys = Object.keys(cursos);
                    const notas = {};
                    cursosKeys
                        .map((cursoKey) => {
                        return { [`cursos.${cursoKey}`]: cursos[cursoKey] };
                    })
                        .forEach((element) => {
                        notas[Object.keys(element)[0]] = Object.values(element)[0];
                    });
                    //  const notas2: { [key: string]: CursoNotaRecord } = Object.fromEntries(
                    //    cursosKeys.map((cursoKey) => {
                    //      return  [ `cursos.${cursoKey}`, cursos[cursoKey] ]
                    //    }),
                    //  )
                    yield collection.updateOne({ alumnoId: new mongodb_1.ObjectId(record.alumnoId) }, { $set: Object.assign({ tardanzas, inasistencias, conclusionesDescriptivas }, notas) });
                }
            }
            else {
                for (const record of registro) {
                    const { cursos } = record;
                    const cursosKeys = Object.keys(cursos);
                    const notas = {};
                    cursosKeys
                        .map((cursoKey) => {
                        return { [`cursos.${cursoKey}`]: cursos[cursoKey] };
                    })
                        .forEach((element) => {
                        notas[Object.keys(element)[0]] = Object.values(element)[0];
                    });
                    yield collection.updateOne({ alumnoId: new mongodb_1.ObjectId(record.alumnoId) }, { $set: Object.assign({}, notas) });
                }
            }
        });
    }
    static fetchNotasPorAlumnosYCursos({ nivel, year, alumnosIdsList, salon }) {
        var _a, e_1, _b, _c, _d, e_2, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            const notasCollection = db_1.mongoClient.db().collection(`notas${nivel}${year}`);
            const cursosList = {};
            salon.cursos.forEach((curso) => {
                cursosList[curso.key] = 1;
            });
            if (salon.tutor) {
                const cursor = notasCollection.aggregate([
                    { $match: { alumnoId: { $in: alumnosIdsList } } },
                    {
                        $lookup: {
                            from: `matriculados${nivel}${year}`,
                            localField: 'alumnoId',
                            foreignField: '_id',
                            as: 'estudiante',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            alumnoId: 1,
                            tardanzas: 1,
                            inasistencias: 1,
                            conclusionesDescriptivas: 1,
                            cursos: 1,
                            educando: { $arrayElemAt: ['$estudiante', 0] },
                        },
                    },
                    {
                        $project: {
                            alumnoId: 1,
                            tardanzas: 1,
                            inasistencias: 1,
                            conclusionesDescriptivas: 1,
                            cursos: Object.assign({}, cursosList),
                            nombres: '$educando.nombres',
                            apellidos: '$educando.apellidos',
                        },
                    },
                    { $sort: { apellidos: 1, nombres: 1 } },
                ]);
                const records = [];
                try {
                    for (var _g = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _g = true) {
                        _c = cursor_1_1.value;
                        _g = false;
                        const doc = _c;
                        records.push(doc);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_g && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return records;
            }
            else {
                const cursor = notasCollection.aggregate([
                    { $match: { alumnoId: { $in: alumnosIdsList } } },
                    {
                        $lookup: {
                            from: `matriculados${nivel}${year}`,
                            localField: 'alumnoId',
                            foreignField: '_id',
                            as: 'estudiante',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            alumnoId: 1,
                            cursos: 1,
                            educando: { $arrayElemAt: ['$estudiante', 0] },
                        },
                    },
                    {
                        $project: {
                            alumnoId: 1,
                            cursos: Object.assign({}, cursosList),
                            nombres: '$educando.nombres',
                            apellidos: '$educando.apellidos',
                        },
                    },
                    { $sort: { apellidos: 1, nombres: 1 } },
                ]);
                const records = [];
                try {
                    for (var _h = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _d = cursor_2_1.done, !_d; _h = true) {
                        _f = cursor_2_1.value;
                        _h = false;
                        const doc = _f;
                        records.push(doc);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (!_h && !_d && (_e = cursor_2.return)) yield _e.call(cursor_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return records;
            }
        });
    }
    static getRecordNotasAlumno({ alumnoId, nivel, year }) {
        var _a, e_3, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const notasCollection = `notas${nivel}${year}`;
            const alumnosCollection = `matriculados${nivel}${year}`;
            const cursor = db_1.mongoClient
                .db()
                .collection(notasCollection)
                .aggregate([
                { $match: { alumnoId: new mongodb_1.ObjectId(alumnoId) } },
                { $lookup: { from: alumnosCollection, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
                { $project: { _id: 0, alumnoId: 1, estudiante: 1, tardanzas: 1, inasistencias: 1, conclusionesDescriptivas: 1, cursos: 1 } },
            ]);
            let registros = [];
            try {
                for (var _d = true, cursor_3 = __asyncValues(cursor), cursor_3_1; cursor_3_1 = yield cursor_3.next(), _a = cursor_3_1.done, !_a; _d = true) {
                    _c = cursor_3_1.value;
                    _d = false;
                    const registro = _c;
                    registros.push(registro);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_3.return)) yield _b.call(cursor_3);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return registros;
        });
    }
    static getRegistrosByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula, excluirAtrasados = false, }) {
        var _a, e_4, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const notasCollection = `notas${nivel}${year}`;
            const alumnosCollection = `matriculados${nivel}${year}`;
            const pensionesCollection = `pensiones${nivel}${year}`;
            const currentMes = new Date().getMonth();
            let cursor;
            if (excluirAtrasados) {
                cursor = db_1.mongoClient
                    .db()
                    .collection(notasCollection)
                    .aggregate([
                    { $lookup: { from: pensionesCollection, localField: 'alumnoId', foreignField: 'alumnoId', as: 'recordPensiones' } },
                    { $set: { recordPensiones: '$recordPensiones.pensiones' } },
                    { $set: { recordPensiones: { $arrayElemAt: ['$recordPensiones', 0] } } },
                    {
                        $addFields: {
                            pensiones: { $filter: { input: '$recordPensiones', cond: { $lt: ['$$this.mes', currentMes] } } },
                            pensionesPagadas: { $filter: { input: '$recordPensiones', cond: { $and: [{ $lt: ['$$this.mes', currentMes] }, { $eq: ['$$this.pagado', true] }] } } },
                        },
                    },
                    { $match: { $expr: { $eq: [{ $size: '$pensiones' }, { $size: '$pensionesPagadas' }] } } },
                    { $match: { $expr: { $eq: [{ $size: '$pensiones' }, { $size: '$pensionesPagadas' }] } } },
                    { $unset: ['pensiones', 'pensionesPagadas', 'recordPensiones'] },
                    { $lookup: { from: alumnosCollection, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
                    {
                        $match: {
                            'estudiante.grado': grado,
                            'estudiante.seccion': seccion,
                            'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] },
                        },
                    },
                ]);
            }
            else {
                cursor = db_1.mongoClient
                    .db()
                    .collection(notasCollection)
                    .aggregate([
                    {
                        $lookup: {
                            from: alumnosCollection,
                            localField: 'alumnoId',
                            foreignField: '_id',
                            as: 'estudiante',
                        },
                    },
                    {
                        $match: {
                            'estudiante.grado': grado,
                            'estudiante.seccion': seccion,
                            'estudiante.estadoMatricula': { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] },
                        },
                    },
                ]);
            }
            let registros = [];
            try {
                for (var _d = true, cursor_4 = __asyncValues(cursor), cursor_4_1; cursor_4_1 = yield cursor_4.next(), _a = cursor_4_1.done, !_a; _d = true) {
                    _c = cursor_4_1.value;
                    _d = false;
                    const doc = _c;
                    registros.push(doc);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_4.return)) yield _b.call(cursor_4);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return registros;
        });
    }
    static updateRegistroNotas({ collectionName, registro }) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const record of registro) {
                const { tardanzas, inasistencias, conclusionesDescriptivas, cursos } = record;
                yield db_1.mongoClient
                    .db()
                    .collection(collectionName)
                    .updateOne({ alumnoId: new mongodb_1.ObjectId(record.alumnoId) }, { $set: { tardanzas, inasistencias, conclusionesDescriptivas, cursos: Object.assign({}, cursos) } });
            }
        });
    }
    static fetchRegistroNotasBySalon({ nivel, year, alumnosIds }) {
        var _a, e_5, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const notasCollection = `notas${nivel}${year}`;
            const alumnosCollection = `matriculados${nivel}${year}`;
            const registroNotas = [];
            const registrosCursos = db_1.mongoClient
                .db()
                .collection(notasCollection)
                .aggregate([
                { $match: { alumnoId: { $in: alumnosIds } } },
                {
                    $lookup: {
                        from: alumnosCollection,
                        localField: 'alumnoId',
                        foreignField: '_id',
                        as: 'estudiante',
                    },
                },
                {
                    $project: {
                        _id: 0,
                        alumnoId: 1,
                        educando: { $arrayElemAt: ['$estudiante', 0] },
                        tardanzas: 1,
                        inasistencias: 1,
                        conclusionesDescriptivas: 1,
                        cursos: 1,
                    },
                },
                {
                    $project: {
                        alumnoId: 1,
                        nombres: '$educando.nombres',
                        apellidos: '$educando.apellidos',
                        estadoMatricula: '$educando.estadoMatricula',
                        grado: '$educando.grado',
                        seccion: '$educando.seccion',
                        tardanzas: 1,
                        inasistencias: 1,
                        conclusionesDescriptivas: 1,
                        cursos: 1,
                    },
                },
                { $sort: { apellidos: 1, nombres: 1 } },
            ]);
            try {
                for (var _d = true, registrosCursos_1 = __asyncValues(registrosCursos), registrosCursos_1_1; registrosCursos_1_1 = yield registrosCursos_1.next(), _a = registrosCursos_1_1.done, !_a; _d = true) {
                    _c = registrosCursos_1_1.value;
                    _d = false;
                    const registro = _c;
                    registroNotas.push(registro);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = registrosCursos_1.return)) yield _b.call(registrosCursos_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            // await notasCursor.forEach((registro) => {
            //   registroNotas.push(registro)
            // })
            return registroNotas;
        });
    }
    static fetchNumeroResolucion(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient.db().collection(collectionName).findOne({});
            if (!response) {
                yield db_1.mongoClient.db().collection(collectionName).insertOne({ count: 1 });
                return 1;
            }
            return response.count;
        });
    }
    static increaseNumeroResolucion(collectionName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.mongoClient
                .db()
                .collection(collectionName)
                .updateOne({}, { $inc: { count: 1 } });
        });
    }
}
exports.default = Documento;
