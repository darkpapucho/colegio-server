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
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
class AsistenciaEmpleados {
    static getEmpleadoInfoByFingerprintId({ fingerprintId, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient.db().collection(`empleados${year}`).findOne({ fingerprintId });
            return response;
        });
    }
    static enrollNewFingerprintId({ year, fingerprintId, empleadoInfo }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { empleadoId } = empleadoInfo, rest = __rest(empleadoInfo, ["empleadoId"]);
            const response = yield db_1.mongoClient
                .db()
                .collection(`empleados${year}`)
                .updateOne({ empleadoId: new mongodb_1.ObjectId(empleadoId) }, { $set: Object.assign({ fingerprintId }, rest) }, { upsert: true });
            return response;
        });
    }
    static marcarAsistenciaEmpleados({ month, day, time, empleadoId, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`asistenciaempleados${year}`)
                .updateOne({ empleadoId: new mongodb_1.ObjectId(empleadoId) }, { $push: { asistencias: { month, day, time } } });
            return response;
        });
    }
    static checkAsistenciaRecord({ empleadoId, year, month, day }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`asistenciaempleados${year}`)
                .findOne({ empleadoId: new mongodb_1.ObjectId(empleadoId), asistencias: { $elemMatch: { day, month } } });
            return response;
        });
    }
}
exports.default = AsistenciaEmpleados;
