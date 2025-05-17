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
const db_1 = require("../db");
const mongodb_1 = require("mongodb");
const hashPassword_1 = require("../utils/hashPassword");
class Empleado {
    static findTutorByGradoSeccion({ nivel, year, grado, seccion }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient
                .db()
                .collection(`empleados${nivel}${year}`)
                .aggregate([
                {
                    $match: { rol: 'profesor' },
                },
                {
                    $project: {
                        nombres: 1,
                        apellidos: 1,
                        salones: { $filter: { input: '$salones', as: 'salon', cond: { $and: [{ $eq: ['$$salon.label', `${grado} ${seccion}`] }, { $eq: ['$$salon.tutor', true] }] } } },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        nombreCompleto: { $concat: ['$apellidos', ', ', '$nombres'] },
                        salon: { $arrayElemAt: ['$salones', 0] },
                    },
                },
                { $match: { salon: { $exists: true, $ne: null } } },
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
            return result[0];
        });
    }
    static deleteAnuncioProfesor({ nivel, year, anuncioId, profesorId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`empleados${nivel}${year}`)
                .updateOne({ _id: new mongodb_1.ObjectId(profesorId) }, { $pull: { anuncios: { _id: new mongodb_1.ObjectId(anuncioId) } } });
            return response;
        });
    }
    static agregarAnuncioProfesor({ salones, nivel, year, content, title, date, profesorId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const anuncioId = new mongodb_1.ObjectId();
            yield db_1.mongoClient
                .db()
                .collection(`empleados${nivel}${year}`)
                .updateOne({ _id: new mongodb_1.ObjectId(profesorId) }, { $push: { anuncios: { content, title, date, _id: anuncioId, salones } } });
            return anuncioId;
        });
    }
    static deleteHorarioCell({ nivel, year, startTime, endTime, curso, salon, profesorId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`empleados${nivel}${year}`)
                .updateOne({ _id: new mongodb_1.ObjectId(profesorId) }, { $pull: { horario: { startTime, endTime, curso, salon } } });
            return response;
        });
    }
    static fetchProfesorHorario({ nivel, year, profesorId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`empleados${nivel}${year}`)
                .findOne({ _id: new mongodb_1.ObjectId(profesorId) }, { projection: { horario: 1, _id: 0 } });
            return response;
        });
    }
    static agregarHorarioCell({ startTime, endTime, profesorId, curso, salon, nivel, year, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = db_1.mongoClient
                .db()
                .collection(`empleados${nivel}${year}`)
                .updateOne({ _id: new mongodb_1.ObjectId(profesorId) }, { $push: { horario: { startTime, endTime, curso, salon } } });
            return response;
        });
    }
    static deleteProfesor({ nivel, year, userId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`empleados${nivel}${year}`)
                .deleteOne({ userId: new mongodb_1.ObjectId(userId) });
            return response;
        });
    }
    static updateProfesorPassword({ newPassword, userId, nivel }) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPass = yield (0, hashPassword_1.hashPassword)(newPassword);
            const response = yield db_1.mongoClient
                .db()
                .collection(`users${nivel}`)
                .updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $set: { password: hashedPass } });
            return response;
        });
    }
    static updateProfesor({ nivel, year, profesor }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id, userId } = profesor, rest = __rest(profesor, ["_id", "userId"]);
            const collectionName = `empleados${nivel}${year}`;
            const response = yield db_1.mongoClient
                .db()
                .collection(collectionName)
                .updateOne({ _id: new mongodb_1.ObjectId(_id) }, { $set: Object.assign({}, rest) });
            return response;
        });
    }
    static crearProfesor({ nivel, year, newProfesor, session }) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleadosCollection = `empleados${nivel}${year}`;
            const response = db_1.mongoClient
                .db()
                .collection(empleadosCollection)
                .insertOne(Object.assign(Object.assign({}, newProfesor), { userId: new mongodb_1.ObjectId(newProfesor.userId) }), { session });
            return response;
        });
    }
    static fetchProfesores({ nivel, year }) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const collectionName = `empleados${nivel}${year}`;
            const cursor = db_1.mongoClient.db().collection(collectionName).find({ rol: 'profesor' });
            const profesores = [];
            try {
                for (var _d = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _a = cursor_2_1.done, !_a; _d = true) {
                    _c = cursor_2_1.value;
                    _d = false;
                    const doc = _c;
                    profesores.push(doc);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_2.return)) yield _b.call(cursor_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return profesores;
        });
    }
}
exports.default = Empleado;
