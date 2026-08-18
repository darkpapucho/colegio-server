"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asistenciaEmpleadosRouter = void 0;
const express_1 = require("express");
const AsistenciaEmpleados_1 = __importDefault(require("../controllers/AsistenciaEmpleados"));
exports.asistenciaEmpleadosRouter = (0, express_1.Router)();
exports.asistenciaEmpleadosRouter.get('/get-empleado-info-by-fingerprint', AsistenciaEmpleados_1.default.getEmpleadoInfoByFingerprintId);
