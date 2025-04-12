"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anotacionesRelevantesRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const AnotacionesRelevantes_1 = __importDefault(require("../controllers/AnotacionesRelevantes"));
exports.anotacionesRelevantesRouter = (0, express_1.Router)();
exports.anotacionesRelevantesRouter.post('/editar-anotacion-relevante-by-alumnoId', verifyCredentials_1.verifyCredentials, AnotacionesRelevantes_1.default.editarAnotacionByAlumnoId);
exports.anotacionesRelevantesRouter.post('/eliminar-anotacion-relevante-by-alumno-id', verifyCredentials_1.verifyCredentials, AnotacionesRelevantes_1.default.eliminarAnotacionByAlumnoId);
