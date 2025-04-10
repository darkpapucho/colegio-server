"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pensionRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const pension_1 = __importDefault(require("../controllers/pension"));
exports.pensionRouter = (0, express_1.Router)();
exports.pensionRouter.post('/get-lista-by-grado-seccion', verifyCredentials_1.verifyCredentials, pension_1.default.getListGradoSeccion);
exports.pensionRouter.post('/pagar-pension-alumnoid-mes', verifyCredentials_1.verifyCredentials, pension_1.default.pagarPensionByAlumnoIdAndMonth);
exports.pensionRouter.post('/update-monto-pagar-pensiones', verifyCredentials_1.verifyCredentials, pension_1.default.updateMontoPagarPension);
