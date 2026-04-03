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
const db_1 = require("../db");
const alumno_1 = require("../models/alumno");
const Notas_1 = __importDefault(require("../models/Notas"));
class CursosController {
    static getCursosByNivel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel } = (0, global_1.extractNivelYearFromHeaders)(req);
                const data = yield Cursos_1.default.getCursosByNivel({ nivel });
                console.log({ cursos: data === null || data === void 0 ? void 0 : data.cursos });
                res.send((0, responses_1.responseOk)(data === null || data === void 0 ? void 0 : data.cursos));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static updateCursosSalon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { cursos, grado, seccion } = req.body;
                const session = db_1.mongoClient.startSession();
                session.startTransaction();
                //update las cursos del salon
                const response = yield Cursos_1.default.updateCursosSalon({ nivel, year, cursos, grado, seccion, session });
                if (!response.acknowledged || !response.matchedCount) {
                    yield session.abortTransaction();
                    yield session.endSession();
                    throw new Error('no se pudo modificar los cursos del salon');
                }
                const cursosKey = cursos.map((curso) => curso.key);
                const alumnosId = yield alumno_1.Alumno.fetchAlumnosIdsByGradoSeccion({ grado, seccion, nivel, year });
                const notasUpdateResponse = yield Notas_1.default.updateCursosFieldsByAlumnosId({ nivel, year, alumnosId, cursosKey, session });
                if (!notasUpdateResponse.acknowledged || !notasUpdateResponse.matchedCount) {
                    yield session.abortTransaction();
                    yield session.endSession();
                    throw new Error('no se pudo modificar los cursos del salon');
                }
                yield session.commitTransaction();
                yield session.endSession();
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
                const { grado } = req.query;
                const response = yield Cursos_1.default.getCursosSalon({ nivel, year, grado: grado });
                if (!response)
                    return res.send((0, responses_1.responseError)(`${grado}  no es un salón válido`));
                return res.send((0, responses_1.responseOk)(response));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = CursosController;
