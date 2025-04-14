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
const pension_1 = __importDefault(require("../models/pension"));
const global_1 = require("../utils/global");
const responses_1 = require("../utils/responses");
const pdfkit_1 = __importDefault(require("pdfkit"));
const pensionTablePdf_1 = require("../utils/pensionTablePdf");
const drawCellTable_1 = require("../utils/drawCellTable");
const vars_1 = require("../utils/generarBoletaNotas/utils/vars");
class PensionController {
    static generatetPensionesTablePdfByGradoSeccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion } = req.body;
                const list = yield pension_1.default.getListByGradoSeccion({ nivel, year, grado, seccion });
                //parse the data:
                const data = yield list.map((record) => ({ alumno: record.estudiante.nombreCompleto, pensiones: record.pensiones }));
                const document = new pdfkit_1.default({ autoFirstPage: false, layout: 'landscape' });
                document.pipe(res);
                document.addPage();
                const BEGIN = { x: 20, y: 20 };
                const CELL_HEIGHT = 20;
                const CELL_WIDTH = 100;
                const CELL_WIDTH_DATA = 180;
                (0, drawCellTable_1.drawCell)(document, { begin: { x: BEGIN.x, y: BEGIN.y }, height: 20, width: CELL_WIDTH, content: `  COLEGIO`, options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' } });
                (0, drawCellTable_1.drawCell)(document, {
                    begin: { x: BEGIN.x, y: BEGIN.y + CELL_HEIGHT },
                    height: 20,
                    width: CELL_WIDTH,
                    content: `  NIVEL`,
                    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
                });
                (0, drawCellTable_1.drawCell)(document, {
                    begin: { x: BEGIN.x + CELL_WIDTH, y: BEGIN.y },
                    height: 20,
                    width: CELL_WIDTH_DATA,
                    content: `  ${vars_1.NOMBRE_COLEGIO.toUpperCase()}`,
                    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
                });
                (0, drawCellTable_1.drawCell)(document, {
                    begin: { x: BEGIN.x + CELL_WIDTH, y: BEGIN.y + CELL_HEIGHT },
                    height: 20,
                    width: CELL_WIDTH_DATA,
                    content: `  ${nivel.toUpperCase()}`,
                    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
                });
                //###########################
                (0, drawCellTable_1.drawCell)(document, {
                    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA, y: BEGIN.y },
                    height: 20,
                    width: CELL_WIDTH_DATA,
                    content: `  GRADO`,
                    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
                });
                (0, drawCellTable_1.drawCell)(document, {
                    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA, y: BEGIN.y + CELL_HEIGHT },
                    height: 20,
                    width: CELL_WIDTH,
                    content: `  SECCIÓN`,
                    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
                });
                (0, drawCellTable_1.drawCell)(document, {
                    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA + CELL_WIDTH, y: BEGIN.y },
                    height: 20,
                    width: CELL_WIDTH,
                    content: `  ${grado}`,
                    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
                });
                (0, drawCellTable_1.drawCell)(document, {
                    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA + CELL_WIDTH, y: BEGIN.y + CELL_HEIGHT },
                    height: 20,
                    width: CELL_WIDTH,
                    content: `  ${seccion}`,
                    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
                });
                (0, pensionTablePdf_1.generatePensionTablePdf)(document, data, 'primerSemestre');
                document.addPage();
                (0, pensionTablePdf_1.generatePensionTablePdf)(document, data, 'segundoSemestre');
                document.end();
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getRecordPensionesPagadasByDateRange(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { initDate, endDate } = req.body;
                const response = yield pension_1.default.getRecordPensionesPagadasByDateRange({ nivel, year, initDate, endDate });
                res.send((0, responses_1.responseOk)(response));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getListAlumnosByNumPensionesAtrasadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { numeroPensionesAtrasadas, currentMonth } = req.body;
                //const delta = 10 - pensiones.length
                //numPensionesPagadas = currentMonth - 1 - numeroPensionesAtrasadas- delta
                const response = yield pension_1.default.getListAlumnosByNumPensionesAtrasadas({ nivel, year, numeroPensionesAtrasadas, currentMonth });
                res.send((0, responses_1.responseOk)(response));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getPensionesGlobalReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { currentMonth } = req.body;
                const consolidado = Array.from({ length: currentMonth }, (_, i) => {
                    //caso de marzo: length = 2 -> 0 y 1;
                    return { numeroPensionesAtrasadas: i, totalAlumnos: 0 };
                });
                const list = yield pension_1.default.getPensionesGlobalReport({ nivel, year });
                list.forEach((record) => {
                    const delta = 10 - record.pensiones.length;
                    //para los alumnos que han pagado pensiones por adelantado el resultado de la sgte operacion es negativo, manejar ese caso:
                    let numeroPensionesAtrasadas = currentMonth - 1 - record.numPensionesPagadas - delta;
                    numeroPensionesAtrasadas = numeroPensionesAtrasadas >= 0 ? numeroPensionesAtrasadas : 0;
                    consolidado[numeroPensionesAtrasadas].totalAlumnos = consolidado[numeroPensionesAtrasadas].totalAlumnos + 1;
                });
                res.send((0, responses_1.responseOk)(consolidado));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getListGradoSeccion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { grado, seccion, estadosMatricula } = req.body;
                const pensiones = yield pension_1.default.getListByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula });
                res.send((0, responses_1.responseOk)(pensiones));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static pagarPensionByAlumnoIdAndMonth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            //monto abonado: es lo que el cliente a abonado en esta operacion
            //monto_pagado: es lo que el cliente ya había pagado anteriormente
            //monto_pagar: el total q tiene q pagar el cliente
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { alumnoId, fecha, mes, monto_pagado, monto_pagar, monto_abonado, issuer } = req.body;
                //validación
                const saldoPagar = monto_pagar - monto_pagado;
                if (monto_abonado > saldoPagar || (monto_abonado === 0 && monto_pagar > 0)) {
                    throw new Error('Monto abonado inválido');
                }
                const reciboId = yield pension_1.default.pagarPensionByAlumnoIdAndMonth({ issuer, nivel, year, alumnoId, fecha, mes, monto_abonado, monto_pagar, monto_pagado });
                res.send((0, responses_1.responseOk)({ reciboId: reciboId ? reciboId : '' }));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static updateMontoPagarPension(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { pensiones, alumnoId } = req.body;
                yield pension_1.default.updateMontoPagarPension({ nivel, year, pensiones, alumnoId });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = PensionController;
