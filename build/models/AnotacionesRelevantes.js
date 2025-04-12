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
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
class AnotacionesRelevantes {
    static editarAnotacionByAlumnoId({ nivel, year, alumnoId, issuer, fecha, detalle }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`anotacionesRelevantes${nivel}${year}`)
                .updateOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) }, { $set: { fecha, issuer: new mongodb_1.ObjectId(issuer), detalle } }, { upsert: true });
            return response;
        });
    }
    static fetchAnotacionByAlumnoId({ nivel, year, alumnoId }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.mongoClient
                .db()
                .collection(`anotacionesRelevantes${nivel}${year}`)
                .findOne({ alumnoId: new mongodb_1.ObjectId(alumnoId) });
        });
    }
}
exports.default = AnotacionesRelevantes;
