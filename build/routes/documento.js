"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentoRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const Documento_1 = __importDefault(require("../controllers/Documento"));
exports.documentoRouter = (0, express_1.Router)();
exports.documentoRouter.post('/emitirdocumentos', verifyCredentials_1.verifyCredentials, Documento_1.default.emitirDocumentos);
exports.documentoRouter.get('/fetch-registro-notas-salon', verifyCredentials_1.verifyCredentials, Documento_1.default.fetchRegistroNotasBySalon);
exports.documentoRouter.post('/update-registro-notas', verifyCredentials_1.verifyCredentials, Documento_1.default.updateRegistroNotas);
exports.documentoRouter.post('/generar-boletas-notas-grado-seccion', verifyCredentials_1.verifyCredentials, Documento_1.default.generateLibretasByGradoSeccion);
