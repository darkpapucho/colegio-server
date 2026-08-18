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
const global_1 = require("../utils/global");
const responses_1 = require("../utils/responses");
const errors_1 = require("../error/errors");
const AsistenciaEmpleados_1 = __importDefault(require("../models/AsistenciaEmpleados"));
const asistencia_1 = require("../utils/asistencia");
class AsistenciaEmpleadosController {
    static enrollFingerPrintToEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year, nivel } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { empleadoInfo, fingerprintId, enrollDate } = req.body;
                empleadoInfo.nivel = nivel;
                empleadoInfo.enrollDate = enrollDate;
                const response = yield AsistenciaEmpleados_1.default.enrollNewFingerprintId({ empleadoInfo, year, fingerprintId });
                res.status(200).send((0, responses_1.responseOk)(response.upsertedId));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static getEmpleadoInfoByFingerprintId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { id } = req.query;
                const empleadoInfo = yield AsistenciaEmpleados_1.default.getEmpleadoInfoByFingerprintId({ year, fingerprintId: id });
                console.log({ nivel, year });
                console.log({ empleadoInfo });
                res.status(200).send((0, responses_1.responseOk)(empleadoInfo));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static marcarAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { month, day, time, fingerprintId } = req.body;
                const empleadoInfo = yield AsistenciaEmpleados_1.default.getEmpleadoInfoByFingerprintId({ year, fingerprintId });
                if (!empleadoInfo)
                    throw new Error('empleado no registrado');
                const empleadoId = empleadoInfo.empleadoId.toString();
                const isAlreadyFilled = yield AsistenciaEmpleados_1.default.checkAsistenciaRecord({ year, month, day, empleadoId });
                if (isAlreadyFilled) {
                    throw new Error('la asistencia ya está marcada');
                }
                const response = yield AsistenciaEmpleados_1.default.marcarAsistenciaEmpleados({ month, day, time, empleadoId, year });
                if (!response.modifiedCount)
                    throw new Error('no se pudo marcar la asistencia');
                res.status(200).send((0, responses_1.responseOk)((0, asistencia_1.getAsistenciaMessage)(time)));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = AsistenciaEmpleadosController;
