"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagosRouter = void 0;
const express_1 = require("express");
const verifyCredentials_1 = require("../middleware/verifyCredentials");
const Pagos_1 = __importDefault(require("../controllers/Pagos"));
exports.pagosRouter = (0, express_1.Router)();
exports.pagosRouter.post('/get-recibo-matricula', verifyCredentials_1.verifyCredentials, Pagos_1.default.getReciboMatricula);
exports.pagosRouter.get('/fetch-otras-deudas', verifyCredentials_1.verifyCredentials, Pagos_1.default.fetchOtrasDeudas);
