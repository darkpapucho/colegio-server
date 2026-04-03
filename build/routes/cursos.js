"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cursosRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const Cursos_1 = __importDefault(require("../controllers/Cursos"));
exports.cursosRouter = (0, express_1.Router)();
exports.cursosRouter.post('/update-cursos-salon', verifyCredentials_1.verifyCredentials, Cursos_1.default.updateCursosSalon);
exports.cursosRouter.get('/get-cursos-salon', verifyCredentials_1.verifyCredentials, Cursos_1.default.getCursosSalon);
exports.cursosRouter.get('/fetch-by-nivel', verifyCredentials_1.verifyCredentials, Cursos_1.default.getCursosByNivel);
