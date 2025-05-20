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
const Notas_1 = __importDefault(require("../models/Notas"));
const responses_1 = require("../utils/responses");
const Cursos_1 = __importDefault(require("../models/Cursos"));
const empleado_1 = __importDefault(require("../models/empleado"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateLibretasPrimaria_1 = __importDefault(require("../utils/generateNuevasLibretasPrimaria/generateLibretasPrimaria"));
const Calendario_1 = __importDefault(require("../models/Calendario"));
const archiver_1 = require("../utils/generateNuevasLibretasPrimaria/archiver");
class NotasController {
    static getNotasByGradoSeccionProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                if (nivel !== 'primaria')
                    throw new Error('ruta válida solo para el nivel inicial');
                const { grado, seccion, isTutor, cursosProfesor } = req.body;
                if (!grado || !seccion)
                    throw new Error('grado o seccion inválido');
                const cursosQuery = Object.fromEntries(cursosProfesor.map((curso) => [curso.key, 1]));
                const registroNotas = yield Notas_1.default.getNotasByGradoSeccionFromCursosProfesor({ grado, seccion, isTutor, cursosQuery, nivel, year });
                res.send((0, responses_1.responseOk)(registroNotas));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static updateRecordNotasByTeacher(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { isTutor, registro, cursosProfesor } = req.body;
                yield Notas_1.default.updateRecordNotasByTeacher({ nivel, year, registro, isTutor, cursosProfesor });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static generateLibretasPrimaria(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                if (nivel !== 'primaria')
                    throw new Error('Esta ruta solo aplica al nivel primaria');
                const { grado, seccion, zipped, estadosMatricula } = req.body;
                // console.log({ nivel, year, zipped })
                const tutor = yield empleado_1.default.findTutorByGradoSeccion({ grado, seccion, nivel, year });
                const registro = yield Notas_1.default.getNotasByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula });
                const cursosSalon = yield Cursos_1.default.getCursosSalon({ nivel, grado, seccion, year });
                const currentPeriodo = yield Calendario_1.default.fetchCurrentPeriodo({ nivel, year });
                if (cursosSalon == null || !currentPeriodo || !currentPeriodo)
                    throw new Error('error parsing data');
                if (zipped) {
                    yield (0, archiver_1.zipLibretasPrimaria)({ res, tutor: tutor.nombreCompleto, nivel, grado, seccion, year, registro, cursosSalon: cursosSalon.cursos, periodo: currentPeriodo.periodo });
                }
                else {
                    const pdfDocument = new pdfkit_1.default({ layout: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 }, autoFirstPage: false, size: 'A4' });
                    pdfDocument.pipe(res);
                    registro.forEach((row) => {
                        (0, generateLibretasPrimaria_1.default)({
                            notas: row,
                            nivel,
                            year,
                            grado,
                            seccion,
                            doc: pdfDocument,
                            tutor: tutor.nombreCompleto,
                            cursosSalon: cursosSalon.cursos,
                            periodo: currentPeriodo === null || currentPeriodo === void 0 ? void 0 : currentPeriodo.periodo,
                        });
                    });
                    pdfDocument.end();
                }
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getNotasByGradoSeccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                if (nivel !== 'primaria')
                    throw new Error('ruta válida solo para el nivel inicial');
                const { grado, seccion } = req.query;
                if (!grado || !seccion)
                    throw new Error('grado o seccion inválido');
                // const tutor = await Empleado.findTutorByGradoSeccion({ nivel, year, grado: grado as Grado, seccion: seccion as Seccion })
                const registroNotas = yield Notas_1.default.getNotasByGradoSeccion({ grado: grado, seccion: seccion, nivel, year });
                const cursosSalon = yield Cursos_1.default.getCursosSalon({ grado: grado, seccion: seccion, nivel, year });
                res.send((0, responses_1.responseOk)({ registroNotas, cursosSalon: cursosSalon === null || cursosSalon === void 0 ? void 0 : cursosSalon.cursos }));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static updateRecordNotasPrimaria(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { registro } = req.body;
                const response = yield Notas_1.default.updateRecordNotasPrimaria({ nivel, year, registro });
                console.log(response.getRawResponse());
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = NotasController;
