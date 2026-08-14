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
const errors_1 = require("../error/errors");
const generateReciboMatr_cula_1 = __importDefault(require("../utils/Recibos/generateReciboMatr\u00EDcula"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const global_1 = require("../utils/global");
const Pagos_1 = __importDefault(require("../models/Pagos"));
const COSTO_MATRICULA_2026 = 150;
class PagosController {
    static getReciboMatricula(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { reciboMatricula } = req.body;
                const data = yield Pagos_1.default.requestReciboById({ nivel, year, reciboId: reciboMatricula });
                if (!data)
                    throw new Error('Invalid recibo, unable to retrieve data');
                const pdfDocument = new pdfkit_1.default({ layout: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 }, autoFirstPage: false, size: 'A4' });
                pdfDocument.pipe(res);
                (0, generateReciboMatr_cula_1.default)(data, pdfDocument, COSTO_MATRICULA_2026);
                pdfDocument.end();
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = PagosController;
