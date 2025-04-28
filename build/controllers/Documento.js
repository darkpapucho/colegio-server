"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const documentos_1 = __importDefault(require("../models/documentos"));
const generarDocumentos_1 = require("../utils/generarDocumentos");
const global_1 = require("../utils/global");
const validators_1 = require("../utils/validators");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const errors_1 = require("../error/errors");
const alumno_1 = require("../models/alumno");
// import { generadorCursos } from '../utils/generateCursosByGradoSeccion'
const responses_1 = require("../utils/responses");
const mongodb_1 = require("mongodb");
const generarBoletaNotas_1 = __importStar(require("../utils/generarBoletaNotas/generarBoletaNotas"));
class DocumentoControllers {
    static fetchNotasByCursos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
            const salon = req.body.salon;
            try {
                //se supone que esta ruta solo es usada por profresores
                const alumnosIdsList = yield alumno_1.Alumno.fetchAlumnosIdsByGradoSeccion({ nivel, year, grado: salon.value.grado, seccion: salon.value.seccion });
                const recordNotas = yield documentos_1.default.fetchNotasPorAlumnosYCursos({ nivel, year, alumnosIdsList, salon });
                res.send((0, responses_1.responseOk)(recordNotas));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static generateLibretaIndividual(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { alumnoId } = req.query;
                (0, validators_1.assertIsString)(alumnoId);
                const notasRecord = yield documentos_1.default.getRecordNotasAlumno({ nivel, year, alumnoId });
                if (!notasRecord) {
                    throw new Error('No se encontró el record de notas del alumno');
                }
                (0, generarBoletaNotas_1.default)({ res, registros: notasRecord, year, nivel });
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static generateLibretasByGradoSeccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { grado, seccion, estadosMatricula, zipped } = req.body;
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                (0, global_1.assertGrado)(grado);
                (0, global_1.assertSeccion)(seccion);
                const registros = yield documentos_1.default.getRegistrosByGradoSeccion({ grado, seccion, nivel, year, estadosMatricula });
                //creacion de la libreta
                //zip archive
                if (zipped) {
                    yield (0, generarBoletaNotas_1.createStudentZipInMemory)({ registros, nivel, grado, seccion, year, res });
                }
                else {
                    (0, generarBoletaNotas_1.default)({ res, registros, year, nivel });
                }
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static updateRegistroNotasProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { registro, isTutor } = req.body;
                yield documentos_1.default.updateRegistroNotasProfesor({ nivel, year, isTutor, registro });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static updateRegistroNotas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { grado, seccion, registro } = req.body;
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                (0, global_1.assertGrado)(grado);
                (0, global_1.assertSeccion)(seccion);
                const collectionName = `notas${nivel}${year}`;
                yield documentos_1.default.updateRegistroNotas({ collectionName, registro: registro });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static fetchRegistroNotasBySalon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { grado, seccion } = req.query;
            const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
            (0, global_1.assertGrado)(grado);
            (0, global_1.assertSeccion)(seccion);
            // const cursos = generadorCursos(nivel, grado)
            try {
                const alumnos = yield alumno_1.Alumno.getByGradoSeccion({ grado, seccion, nivel, year });
                const alumnosIds = alumnos.map((alumno) => new mongodb_1.ObjectId(alumno._id));
                const registroNotas = yield documentos_1.default.fetchRegistroNotasBySalon({ nivel, year, alumnosIds });
                res.send((0, responses_1.responseOk)(registroNotas));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static emitirDocumentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { alumno, data } = req.body;
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                (0, validators_1.assertIsAMatriculado)(alumno);
                (0, validators_1.assertIsEmitirDocumentsData)(data);
                const document = new pdfkit_1.default({ autoFirstPage: false, layout: 'portrait' });
                document.pipe(fs_1.default.createWriteStream('./files/document.pdf'));
                document.pipe(res);
                if (data.selectedDocuments.certificadoNoAdeudo) {
                    (0, generarDocumentos_1.GenerateCertificadoNoAdeudo)({ document, alumno, fechaEmision: data.fechaEmision, nivel });
                }
                if (data.selectedDocuments.certificadoConducta) {
                    (0, generarDocumentos_1.GenerateCertificadoConducta)({ document, nivel, alumno, añoEstudio: year, fechaEmision: data.fechaEmision });
                }
                if (data.selectedDocuments.resolucionTraslado) {
                    const collectionName = `resoluciones${nivel}${new Date(data.fechaEmision).getFullYear()}`;
                    const numeroResolucion = yield documentos_1.default.fetchNumeroResolucion(collectionName);
                    (0, generarDocumentos_1.GenerateResolucionTraslado)({ document, alumno, data, nivel, numeroResolucion });
                    documentos_1.default.increaseNumeroResolucion(collectionName);
                }
                document.end();
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = DocumentoControllers;
