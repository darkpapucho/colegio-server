"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notasRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const Notas_1 = __importDefault(require("../controllers/Notas"));
exports.notasRouter = (0, express_1.Router)();
exports.notasRouter.get('/get-notas-by-grado-seccion', verifyCredentials_1.verifyCredentials, Notas_1.default.getNotasByGradoSeccion);
exports.notasRouter.post('/get-notas-by-grado-seccion-profesor', verifyCredentials_1.verifyCredentials, Notas_1.default.getNotasByGradoSeccionProfesor);
exports.notasRouter.post('/update-record-notas-primaria', verifyCredentials_1.verifyCredentials, Notas_1.default.updateRecordNotasPrimaria);
exports.notasRouter.post('/generate-libretas-primaria-grado-seccion', verifyCredentials_1.verifyCredentials, Notas_1.default.generateLibretasPrimaria);
exports.notasRouter.post('/update-record-notas-primaria-by-teacher', verifyCredentials_1.verifyCredentials, Notas_1.default.updateRecordNotasByTeacher);
exports.notasRouter.post('/generar-informe-rendimiento-csv', verifyCredentials_1.verifyCredentials, Notas_1.default.generarInformeRendimientoCSV);
exports.notasRouter.post('/generar-informe-rendimiento-pdf', verifyCredentials_1.verifyCredentials, Notas_1.default.generarInformeRendimientoPDF);
