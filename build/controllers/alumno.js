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
exports.AlumnoControllers = void 0;
const global_1 = require("../utils/global");
const alumno_1 = require("../models/alumno");
const responses_1 = require("../utils/responses");
const errors_1 = require("../error/errors");
const enums_1 = require("../error/enums");
const validators_1 = require("../utils/validators");
const enums_2 = require("../types/enums");
const mongodb_1 = require("mongodb");
class AlumnoControllers {
    static buscarAlumno(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { nombreCompleto } = req.body;
                const collectionName = `matriculados${nivel}${year}`;
                const alumnos = yield alumno_1.Alumno.buscarAlumno({ nombreCompleto, collectionName });
                res.send((0, responses_1.responseOk)(alumnos));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static retirarAlumno(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id, fechaRetiro } = req.body;
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const collectionName = `matriculados${nivel}${year}`;
                yield alumno_1.Alumno.retirarAlumno({ _id: new mongodb_1.ObjectId(_id), fechaRetiro, collectionName });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static fetchRatificarList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const collectionName = `ratificar${nivel}${year}`;
                const { grado, seccion } = req.query;
                (0, global_1.assertGrado)(grado);
                (0, global_1.assertSeccion)(seccion);
                const alumnos = yield alumno_1.Alumno.getRatificarList({ grado, seccion, collectionName });
                res.status(200).send((0, responses_1.responseOk)(alumnos));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static ratificarMatricula(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req); // asserted
                const currentYear = new Date().getFullYear();
                const { grado } = req.query;
                (0, global_1.assertGrado)(grado);
                if (currentYear - Number(year) !== 1) {
                    throw new Error(enums_1.ErrorMessages.RATIFICACION_MATRICULA_INVALID_AÑO);
                }
                if (grado === 'SEXTO') {
                    throw new Error(enums_1.ErrorMessages.RATIFICACION_MATRICULA_INVALID_GRADO);
                }
                let currentYearCollectionName = '';
                let lastYearCollectionName = '';
                if (grado === enums_2.GradosInicial.Grupo5años) {
                    currentYearCollectionName = `matriculadosprimaria${currentYear}`;
                    lastYearCollectionName = `ratificarinicial${year}`;
                }
                else {
                    currentYearCollectionName = `matriculados${nivel}${currentYear}`;
                    lastYearCollectionName = `ratificar${nivel}${year}`;
                }
                console.log({ currentYearCollectionName, lastYearCollectionName });
                const { alumnos } = req.body;
                //assert alumnos data
                const alumnosParsed = alumnos.map((alumno) => {
                    (0, validators_1.assertIsAMatriculado)(alumno);
                    const currentGradoIndex = enums_2.VALID_GRADOS.indexOf(alumno.grado);
                    alumno.grado = enums_2.VALID_GRADOS[currentGradoIndex + 1];
                    console.log({ gradoDestino: alumno.grado });
                    return alumno;
                });
                yield alumno_1.Alumno.ratificarMatricula({ alumnos: alumnosParsed, currentYearCollectionName, lastYearCollectionName });
                res.status(201).send((0, responses_1.responseOk)(null));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static fetchMatriculados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion } = req.query;
                (0, global_1.assertGrado)(grado);
                (0, global_1.assertSeccion)(seccion);
                const matriculadosCollection = `matriculados${nivel}${year}`;
                const matriculados = yield alumno_1.Alumno.getByGradoSeccion({ grado, seccion, collectionName: matriculadosCollection });
                res.status(200).send((0, responses_1.responseOk)(matriculados));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static nuevaMatricula(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { alumno } = req.body;
                (0, validators_1.assertIsNuevoAlumno)(alumno);
                const matriculadosCollection = `matriculados${nivel}${year}`;
                const result = yield alumno_1.Alumno.nuevaMatricula({ alumno, collectionName: matriculadosCollection });
                if (!result) {
                    throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
                }
                res.status(202).send((0, responses_1.responseOk)(null)); // 202=acepted
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
}
exports.AlumnoControllers = AlumnoControllers;
