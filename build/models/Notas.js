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
class Notas {
    static updateCursosFieldsByAlumnosId({ alumnosId, cursosKey, session, nivel, year }) {
        return __awaiter(this, void 0, void 0, function* () {
            const cursos = Object.fromEntries(cursosKey.map((curso) => [curso, [0, 0, 0, 0]]));
            const response = yield db_1.mongoClient
                .db()
                .collection(`notas${nivel}${year}`)
                .updateMany({ alumnoId: { $in: alumnosId } }, { $set: { cursos } }, { session });
            return response;
        });
    }
}
exports.default = Notas;
