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
const pdfkit_2 = __importDefault(require("pdfkit"));
const generarBoletaNotas_1 = __importDefault(require("../utils/generarBoletaNotas/generarBoletaNotas"));
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
                const libreta = new pdfkit_2.default({
                    layout: 'portrait',
                    size: 'A4',
                    font: 'Courier',
                    margins: { top: 20, left: 20, right: 20, bottom: 20 },
                    autoFirstPage: false,
                });
                libreta.pipe(fs_1.default.createWriteStream('./files/libretaIndividual.pdf'));
                libreta.pipe(res);
                if (notasRecord.length === 0) {
                    libreta.addPage();
                    libreta.text('NO HAY ALUMNOS EN ESTE AÑO/SALÓN', 0, 100, {
                        width: 600,
                        align: 'center',
                    });
                }
                else {
                    (0, generarBoletaNotas_1.default)({ document: libreta, registros: notasRecord, year, nivel });
                }
                libreta.end();
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static generateLibretasByGradoSeccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { grado, seccion } = req.body;
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                (0, global_1.assertGrado)(grado);
                (0, global_1.assertSeccion)(seccion);
                const registros = yield documentos_1.default.getRegistrosByGradoSeccion({ grado, seccion, nivel, year });
                //creacion de la libreta
                const libretas = new pdfkit_2.default({
                    layout: 'portrait',
                    size: 'A4',
                    font: 'Courier',
                    margins: { top: 20, left: 20, right: 20, bottom: 20 },
                    autoFirstPage: false,
                });
                libretas.pipe(fs_1.default.createWriteStream('./files/libreta.pdf'));
                libretas.pipe(res);
                if (registros.length === 0) {
                    libretas.addPage();
                    libretas.text('NO HAY ALUMNOS EN ESTE AÑO/SALÓN', 0, 100, {
                        width: 600,
                        align: 'center',
                    });
                }
                else {
                    (0, generarBoletaNotas_1.default)({ document: libretas, registros, year, nivel });
                }
                libretas.end();
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
                const alumnos = yield alumno_1.Alumno.getByGradoSeccion({ grado, seccion, collectionName: `matriculados${nivel}${year}` });
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
