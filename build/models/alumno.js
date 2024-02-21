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
class Alumno {
    static buscarAlumno({ nombreCompleto, collectionName }) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let alumnos = [];
            const cursor = db_1.mongoClient
                .db()
                .collection(collectionName)
                .find({ $text: { $search: nombreCompleto } }, { sort: { grado: -1 } });
            try {
                for (var _d = true, cursor_1 = __asyncValues(cursor), cursor_1_1; cursor_1_1 = yield cursor_1.next(), _a = cursor_1_1.done, !_a; _d = true) {
                    _c = cursor_1_1.value;
                    _d = false;
                    let doc = _c;
                    alumnos.push(doc);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_1.return)) yield _b.call(cursor_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return alumnos;
        });
    }
    static retirarAlumno({ _id, fechaRetiro, collectionName }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = db_1.mongoClient
                .db()
                .collection(collectionName)
                .updateOne({ _id, estadoMatricula: 'DEFINITIVA' }, { $set: { estadoMatricula: 'TRASLADADO', fechaRetiro } });
            console.log({ responseRetiro: response });
        });
    }
    static getRatificarList({ grado, seccion, collectionName }) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const cursor = db_1.mongoClient.db().collection(collectionName).find({ grado, seccion, estadoMatricula: 'DEFINITIVA' });
            const alumnos = [];
            try {
                for (var _d = true, cursor_2 = __asyncValues(cursor), cursor_2_1; cursor_2_1 = yield cursor_2.next(), _a = cursor_2_1.done, !_a; _d = true) {
                    _c = cursor_2_1.value;
                    _d = false;
                    let alumno = _c;
                    alumnos.push(alumno);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = cursor_2.return)) yield _b.call(cursor_2);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return alumnos;
        });
    }
    static ratificarMatricula({ alumnos, currentYearCollectionName, lastYearCollectionName }) {
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
                console.log({ response1 });
                if (!response1.acknowledged || response1.insertedCount !== cantidadAlumnos) {
                    throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
                }
                const response2 = yield db_1.mongoClient
                    .db()
                    .collection(lastYearCollectionName)
                    .deleteMany({ _id: { $in: alumnosIds } });
                console.log({ response2 });
                if (!response2.acknowledged || response2.deletedCount !== cantidadAlumnos) {
                    throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
                }
                session.commitTransaction();
                // for await(let alumno of alumnos){
                //   mongoClient.db().collection(lastYearCollectionName).deleteOne({_id:new ObjectId(alumno._id)})
                // }
            }
            catch (error) {
                console.log({ ratificarMatriculaError: error });
                yield session.abortTransaction();
                session.endSession();
            }
        });
    }
    static getByGradoSeccion({ grado, seccion, collectionName }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, e_3, _b, _c;
                let alumnos = [];
                const cursor = db_1.mongoClient.db().collection(collectionName).find({ grado, seccion });
                try {
                    for (var _d = true, cursor_3 = __asyncValues(cursor), cursor_3_1; cursor_3_1 = yield cursor_3.next(), _a = cursor_3_1.done, !_a; _d = true) {
                        _c = cursor_3_1.value;
                        _d = false;
                        const doc = _c;
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
                resolve(alumnos);
            }));
        });
    }
    static nuevaMatricula({ alumno, collectionName }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const response = yield db_1.mongoClient
                    .db()
                    .collection(collectionName)
                    .insertOne(Object.assign(Object.assign({}, alumno), { nombreCompleto: alumno.apellidos + ', ' + alumno.nombres, estadoMatricula: 'PENDIENTE' }));
                resolve(response.acknowledged);
            }));
        });
    }
}
exports.Alumno = Alumno;
