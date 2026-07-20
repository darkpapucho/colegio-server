"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const asistencia_1 = __importDefault(require("../controllers/asistencia"));
const asistenciaRouter = (0, express_1.Router)();
asistenciaRouter.post('/marcar-asistencia', verifyCredentials_1.verifyCredentials, asistencia_1.default.marcarAsistencia);
