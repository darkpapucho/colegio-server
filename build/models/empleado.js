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
class Empleado {
    static crearProfesor({ nivel, year, data, userId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const empleadosCollection = `empleados${nivel}${year}`;
            const response = db_1.mongoClient
                .db()
                .collection(empleadosCollection)
                .insertOne(Object.assign(Object.assign({}, data), { userId, rol: 'profesor' }));
            return response;
        });
    }
}
exports.default = Empleado;
