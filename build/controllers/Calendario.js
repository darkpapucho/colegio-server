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
const Calendario_1 = __importDefault(require("../models/Calendario"));
const responses_1 = require("../utils/responses");
const enums_1 = require("../error/enums");
const calendario_1 = require("../utils/calendario");
const convertDateToPeriodo_1 = __importDefault(require("../utils/convertDateToPeriodo"));
const alumno_1 = require("../models/alumno");
const mongodb_1 = require("mongodb");
const pdfkit_1 = __importDefault(require("pdfkit"));
const generatePDFAsistenciaList_1 = require("../utils/generatePDFAsistenciaList");
const periodosDates_1 = require("../vars/periodosDates");
class CalendarioControllers {
    //end point for admin
    static generatePDFAttendanceListByGradoSeccionPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion, periodo, estadosMatricula, withData } = req.body;
                const alumnosList = yield alumno_1.Alumno.getByGradoSeccion({ grado, seccion, nivel, year, estadosMatricula });
                const alumnosIds = alumnosList.map((record) => new mongodb_1.ObjectId(record._id));
                const attendanceList = yield Calendario_1.default.getAsistenciaRecordPeriodo({ periodo, nivel, year, alumnosIds });
                const calendarioDays = yield Calendario_1.default.getCalendarioDaysRange({
                    nivel,
                    year,
                    startDate: new Date((0, periodosDates_1.getPeriodoStartDate)(periodo)),
                    endDate: new Date((0, periodosDates_1.getPeriodoEndDate)(periodo)),
                });
                const pdfDocument = new pdfkit_1.default({
                    layout: 'landscape',
                    size: 'A4',
                    font: 'Courier',
                    margins: { top: 20, left: 20, right: 20, bottom: 20 },
                    autoFirstPage: false,
                });
                pdfDocument.pipe(res);
                (0, generatePDFAsistenciaList_1.generatePDFAsistenciaList)({ nivel, year, grado, seccion, withData, asistenciaList: attendanceList, pdfDocument, periodo, calendarioDays });
                pdfDocument.end();
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static updateAsistenciaListByGradoSeccionDayId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { asistenciaList } = req.body;
                const list = asistenciaList.list;
                const periodo = (0, convertDateToPeriodo_1.default)(new Date());
                const dayId = asistenciaList.dayId;
                //check enabled status from calendario dayId
                //for each element in the list
                list.forEach((record) => __awaiter(this, void 0, void 0, function* () {
                    //procesamos F, A, T y ""
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
                        }
                        else if (oldAsistenciaValue == 'T') {
                            yield alumno_1.Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            yield alumno_1.Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 });
                            yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, alumnoId: record.alumnoId, dayId, asistencia: record.asistencia });
                        }
                    }
                    else if (record.asistencia === 'A' || '') {
                        if (oldAsistenciaValue === 'F') {
                            //DECREMENTAMOS las inasistencias injustificadas
                            if (justificado) {
                                yield alumno_1.Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            }
                            else {
                                yield alumno_1.Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            }
                        }
                        else if (oldAsistenciaValue == 'T') {
                            yield alumno_1.Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                        }
                        yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia });
                    }
                    else if (record.asistencia == 'T') {
                        if (oldAsistenciaValue == 'A' || oldAsistenciaValue == '') {
                        }
                        else if (oldAsistenciaValue == 'F') {
                            if (justificado) {
                                yield alumno_1.Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 });
                            }
                            else {
                                yield alumno_1.Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, periodo, alumnoId: record.alumnoId, quantity: -1 });
                            }
                        }
                        yield alumno_1.Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 });
                        yield Calendario_1.default.setAsistenciaAlumnoDay({ nivel, year, alumnoId: record.alumnoId, dayId, asistencia: record.asistencia });
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
    static fetchTardanzaListByDayId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { dayId } = req.body;
                const tardanzalist = yield Calendario_1.default.fetchAsistenciaListByDayIdAndValue({ nivel, year, dayId, asistenciaValue: 'T' });
                res.send((0, responses_1.responseOk)(tardanzalist));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static fetchAsistenciaListByGradoSeccionDayId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion, month, dayId, estadosMatricula } = req.body;
                const asistenciaList = yield Calendario_1.default.fetchAsistenciaListByGradoSeccionDayId({ nivel, year, grado, seccion, dayId, estadosMatricula });
                res.send((0, responses_1.responseOk)({ asistenciaList, dayId, month }));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static justificarFalta(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { alumnoId, dayId, date } = req.body;
                //check que no se haya justificado anteriormente la falta
                const result = yield Calendario_1.default.getAsistenciaDayStatus({ nivel, year, alumnoId, dayId });
                if (result.record.justificado)
                    return res.send((0, responses_1.responseError)('esta falta ya fue justificada con anterioridad'));
                const periodo = (0, convertDateToPeriodo_1.default)(new Date(date));
                yield Calendario_1.default.justificarFalta({ nivel, year, periodo, alumnoId, dayId });
                return res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getRecordAsistenciasPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion, periodo, estadosMatricula } = req.body;
                const alumnosIds = yield alumno_1.Alumno.fetchAlumnosIdsByGradoSeccion({ nivel, year, grado, seccion, estadoMatricula: estadosMatricula });
                const asistencias = yield Calendario_1.default.getAsistenciaRecordPeriodo({ nivel, year, periodo, alumnosIds });
                const availableDays = yield Calendario_1.default.getAvailableDaysFromCalendarioByPeriodo({ nivel, year, periodo });
                res.send((0, responses_1.responseOk)({ asistencias, availableDays }));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static setCurrentPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const periodo = req.body.periodo;
                yield Calendario_1.default.setCurrentPeriodo({ nivel, year, periodo });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static fetchConvertDateToPeriodo(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const periodo = (0, convertDateToPeriodo_1.default)(new Date());
                return res.send((0, responses_1.responseOk)(periodo));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static fetchCurrentPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const response = yield Calendario_1.default.fetchCurrentPeriodo({ nivel, year });
                if (!response) {
                    return res.send((0, responses_1.responseError)(enums_1.ErrorMessages.PERIODO_NOT_SET));
                }
                return res.send((0, responses_1.responseOk)(response.periodo));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static fetchDayId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { day } = req.body;
                const month = calendario_1.MONTHS_YEAR[new Date().getMonth()];
                const response = yield Calendario_1.default.fetchDayId({ day, month, nivel, year });
                res.status(200).send((0, responses_1.responseOk)(response));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static reportTardanzaAlumno(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { alumnoId, dayId, issuer } = req.body;
                //el status enabled no es imprecindible aqui
                //revisar que no se haya reportado una tardanza con aterioridad
                const results = yield Calendario_1.default.fetchADayAsistenciaRecord({ nivel, year, alumnoId, dayId });
                //si no se encontró ningun record, entonces error
                if (results.length === 0)
                    return res.send((0, responses_1.responseError)(enums_1.ErrorMessages.INVALID_REQUEST));
                const oldAsistenciaValue = results[0].records.asistencia;
                if (oldAsistenciaValue === 'T')
                    return res.send((0, responses_1.responseError)(enums_1.ErrorMessages.TARDANZA_ALREADY_REPORTED));
                //verificar q no se haya pasado asistencia ya
                //if (oldAsistenciaValue === 'A' || oldAsistenciaValue === 'F') return res.send(responseError(ErrorMessages.ASISTENCIA_ALREADY_REPORTED))
                //reportar la tardanza
                yield Calendario_1.default.reportTardanzaAlumno({ nivel, year, alumnoId, dayId, issuer });
                return res.send((0, responses_1.responseOk)(null));
            }
            catch (error) {
                return (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static deleteDayFromCalendar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { dayId } = req.body;
                const response = yield Calendario_1.default.deleteDayFromCalendar({ nivel, year, dayId });
                if (!response.acknowledged || !response.deletedCount) {
                    return res.status(503).send((0, responses_1.responseError)(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED));
                }
                return res.status(200).send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static enableCalendarDays(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { daysList } = req.body;
                yield Calendario_1.default.enableCalendarDays({ nivel, year, daysList });
                res.status(201).send((0, responses_1.responseOk)(null));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static fetchCalendario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const days = yield Calendario_1.default.fetchCalendario({ nivel, year });
                res.status(200).send((0, responses_1.responseOk)(days));
            }
            catch (error) {
                (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
}
exports.default = CalendarioControllers;
