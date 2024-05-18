"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.empleadoRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const empleado_1 = __importDefault(require("../controllers/empleado"));
exports.empleadoRouter = (0, express_1.Router)();
exports.empleadoRouter.post('/crear-profesor', verifyCredentials_1.verifyCredentials, empleado_1.default.crearProfesor);
exports.empleadoRouter.get('/fetch-profesores', verifyCredentials_1.verifyCredentials, empleado_1.default.fetchProfesores);
exports.empleadoRouter.post('/update-profesor', verifyCredentials_1.verifyCredentials, empleado_1.default.updateProfesor);
exports.empleadoRouter.post('/change-profesor-password', verifyCredentials_1.verifyCredentials, empleado_1.default.changeProfesorPassword);
exports.empleadoRouter.post('/delete-profesor', verifyCredentials_1.verifyCredentials, empleado_1.default.deleteProfesor);
