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
class PensionController {
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
