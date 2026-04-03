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
const db_1 = require("../db");
class Cursos {
    static getCursosByNivel({ nivel }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection('cursos')
                .findOne({ nivel }, { projection: { _id: 0, cursos: 1 } });
            return response;
        });
    }
    static updateCursosSalon({ nivel, year, cursos, grado, seccion, session, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient.db().collection(`cursos${nivel}${year}`).updateOne({ grado, seccion }, { $set: { cursos } }, { upsert: true, session });
            return response;
        });
    }
    static getCursosSalon({ nivel, year, grado }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield db_1.mongoClient
                .db()
                .collection(`cursos${nivel}${year}`)
                .findOne({ grado }, { projection: { cursos: 1, _id: 0 } });
            return response;
        });
    }
}
exports.default = Cursos;
