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
exports.AlumnoControllers = void 0;
const global_1 = require("../utils/global");
const alumno_1 = require("../models/alumno");
const responses_1 = require("../utils/responses");
const errors_1 = require("../error/errors");
const enums_1 = require("../error/enums");
const validators_1 = require("../utils/validators");
const enums_2 = require("../types/enums");
const mongodb_1 = require("mongodb");
const Calendario_1 = __importDefault(require("../models/Calendario"));
const convertDateToPeriodo_1 = __importDefault(require("../utils/convertDateToPeriodo"));
class AlumnoControllers {
    static fetchAsistenciaList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion, month, day } = req.body;
                (0, global_1.assertGrado)(grado);
                (0, global_1.assertSeccion)(seccion);
                //check enabled status
                const response = yield Calendario_1.default.checkSalonDayStatusByMonthDay({ nivel, year, month, day });
                if (!response)
                    throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
                if (response.status === 'disabled') {
                    return res.send((0, responses_1.responseError)('La asistencia no se encuentra disponible en este momento'));
                }
                const alumnosList = yield alumno_1.Alumno.fetchAsistenciaList({ grado, seccion, nivel, year, month, dayId: response._id.toString() });
                return res.status(200).send((0, responses_1.responseOk)(alumnosList));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    //end point for teachers
    static updateAsistenciaList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { asistenciaList } = req.body;
                const list = asistenciaList.list;
                const periodo = (0, convertDateToPeriodo_1.default)(new Date());
                const dayId = asistenciaList.dayId;
                //check enabled status from calendario dayId
                const response = yield Calendario_1.default.checkSalonDayStatus({ nivel, year, dayId: asistenciaList.dayId });
                if (!response)
                    throw new Error(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED);
                if (response.status === 'disabled') {
                    return res.send((0, responses_1.responseError)('La asistencia para este día no se encuentra habilitada.'));
                }
                //for each element in the list
                list.forEach((record) => __awaiter(this, void 0, void 0, function* () {
                    //solo procesamos F y A
                    //CHECK the current asistencia status
                    const asistenciaResults = yield Calendario_1.default.fetchADayAsistenciaRecord({ nivel, year, alumnoId: record.alumnoId, dayId });
                    if (!asistenciaResults.length)
                        throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
                    const oldAsistenciaValue = asistenciaResults[0].records.asistencia;
                    const justificado = asistenciaResults[0].records.justificado ? true : false;
                    if (record.asistencia === 'F') {
                        //cheeck q no se haga por segunda vez
                        if (oldAsistenciaValue === '' || oldAsistenciaValue === 'A') {
                            //incrementamos la falta injustificada
                            yield alumno_1.Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 });
                            //pasamos la nueva asistencia
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia });
                            //si el valor anterior ya era F o T no se hace nada (cambiado el 24 de marzo del 2025)
                        }
                        else if (oldAsistenciaValue === 'T') {
                            //disminuimos en 1 la cantidad de tardanzas
                            yield alumno_1.Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            //incrementamos la falta injustificada
                            yield alumno_1.Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 });
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, alumnoId: record.alumnoId, asistencia: record.asistencia, dayId });
                        }
                    }
                    else if (record.asistencia === 'A') {
                        if (oldAsistenciaValue === 'F') {
                            //DECREMENTAMOS las inasistencias injustificadas
                            if (justificado) {
                                yield alumno_1.Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            }
                            else {
                                yield alumno_1.Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            }
                            //pasamos la nueva asistencia
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia });
                        }
                        else if (oldAsistenciaValue === '') {
                            //pasamos la nueva asistencia
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia });
                            //en caso de T o A no es necesario hacer nada(cambiado el 24 de marzo 2025)
                        }
                        else if (oldAsistenciaValue === 'T') {
                            yield alumno_1.Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            //pasamos la nueva asistencia
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia });
                        }
                    }
                    else if (record.asistencia === 'T') {
                        if (oldAsistenciaValue === 'F') {
                            //DECREMENTAMOS las inasistencias injustificadas
                            if (justificado) {
                                yield alumno_1.Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            }
                            else {
                                yield alumno_1.Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            }
                            //pasamos la nueva asistencia
                            yield alumno_1.Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 });
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia });
                        }
                        else if (oldAsistenciaValue === '' || oldAsistenciaValue == 'A') {
                            //pasamos la nueva asistencia
                            yield alumno_1.Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 });
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia });
                        }
                    }
                }));
                //old Code:await Alumno.updateAsistenciaList({ nivel, year, asistenciaList })
                return res.status(200).send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static editarAlumno(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const alumno = req.body.alumno;
                const collectionName = `matriculados${nivel}${year}`;
                const confirmation = yield alumno_1.Alumno.editarAlumno({ alumno, collectionName });
                res.send((0, responses_1.responseOk)(confirmation));
            }
            catch (err) {
                next(err);
            }
        });
    }
    static buscarAlumno(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { nombreCompleto, estadosMatricula } = req.body;
                //TODO: ASSERT ESTADOSMATRICULA
                const collectionName = `matriculados${nivel}${year}`;
                const alumnos = yield alumno_1.Alumno.buscarAlumno({ nombreCompleto, collectionName, estadosMatricula });
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
                const modifiedCount = yield alumno_1.Alumno.retirarAlumno({ _id: new mongodb_1.ObjectId(_id), fechaRetiro, collectionName });
                res.send((0, responses_1.responseOk)({ modifiedCount }));
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
                res.status(200).send((0, responses_1.responseOk)(alumnos.sort((prev, curr) => (prev.apellidos > curr.apellidos ? 1 : -1))));
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
                const { alumnos } = req.body;
                //assert alumnos data
                const alumnosParsed = alumnos.map((alumno) => {
                    (0, validators_1.assertIsAMatriculado)(alumno);
                    const currentGradoIndex = enums_2.VALID_GRADOS.indexOf(alumno.grado);
                    alumno.grado = enums_2.VALID_GRADOS[currentGradoIndex + 1];
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
                alumno.apellidos = alumno.apellidos.toUpperCase();
                alumno.nombres = alumno.nombres.toUpperCase();
                //verificar q no exista un alumno ya matriculado con el mismo dni
                let foundAlumno = null;
                const reason = [];
                if (alumno.dni) {
                    foundAlumno = yield alumno_1.Alumno.fetchAlumnoByDni({ nivel, year, dni: alumno.dni + '' });
                    reason.push('este dni');
                }
                else if (alumno.codigoEstudiante) {
                    foundAlumno = yield alumno_1.Alumno.fetchAlumnoByCodigoEstudiante({ nivel, year, codigoEstudiante: alumno.codigoEstudiante });
                    reason.push('este código de estudiante');
                }
                else {
                    foundAlumno = yield alumno_1.Alumno.fetchAlumnoByGradoSeccionApellidos({ nivel, year, grado: alumno.grado, seccion: alumno.seccion, apellidos: alumno.apellidos });
                    reason.push('estos apellidos');
                }
                if (foundAlumno) {
                    return res.send((0, responses_1.responseError)(`Ya existe un alumno matriculado con ${reason[0]}`));
                }
                //TODO: CREATE SESSION MONGO
                //matricular nuevo alumno
                // const result = await Alumno.nuevaMatricula({ alumno, nivel, year })
                // if (!result.acknowledged) {
                //   return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
                // }
                // const lastDayFromCalendar = await Calendario.fetchLasyDayOfCalendarioEscolar({ nivel, year })
                // const lastDate = new Date(`${lastDayFromCalendar.month}-${lastDayFromCalendar.day}-${year}`)
                // //insertar asistencia records de acuerdo a la fecha de la mtricula
                // const calendarioDaysForMatricula = await Calendario.getCalendarioDaysForNewMatricula({ nivel, year, fechaMatricula: new Date(alumno.fechaMatricula), lastDate })
                // //insertar nuevo record en asistencias{nivel}{year}
                // const alumnoAsistenciaRecords: AsistenciaRecord[] = calendarioDaysForMatricula.map((element) => {
                //   return { dayId: element._id, day: element.day, month: element.month, asistencia: '', modified: '' }
                // })
                // const result2 = await Calendario.insertNewMatriculaRecordAsistenciaEscolar({ nivel, year, alumnoId: result.insertedId, records: alumnoAsistenciaRecords })
                // if (!result2.acknowledged) {
                //   return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
                // }
                const result = yield alumno_1.Alumno.ProcesoNuevoMatricula({ nivel, year, alumno });
                if (!result) {
                    return res.send((0, responses_1.responseError)('Error durante el proceso de matrícula, intentelo nuevamente'));
                }
                return res.status(202).send((0, responses_1.responseOk)(null)); // 202=acepted
            }
            catch (error) {
                return (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
}
exports.AlumnoControllers = AlumnoControllers;
