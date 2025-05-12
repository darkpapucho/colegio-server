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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../error/errors");
const global_1 = require("../utils/global");
const Cursos_1 = __importDefault(require("../models/Cursos"));
const responses_1 = require("../utils/responses");
class CursosController {
    static updateCursosSalon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { cursos, grado, seccion } = req.body;
                const response = yield Cursos_1.default.updateCursosSalon({ nivel, year, cursos, grado, seccion });
                if (!response.acknowledged || !response.matchedCount) {
                    return res.send((0, responses_1.responseError)(`no se pudo modificar los cursos de ${grado} ${seccion}`));
                }
                return res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getCursosSalon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion } = req.query;
                const response = yield Cursos_1.default.getCursosSalon({ nivel, year, grado: grado, seccion: seccion });
                if (!response)
                    return res.send((0, responses_1.responseError)(`${grado} ${seccion} no es un salón válido`));
                return res.send((0, responses_1.responseOk)(response));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = CursosController;
