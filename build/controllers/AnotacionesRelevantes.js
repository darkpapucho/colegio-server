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
const global_1 = require("../utils/global");
const errors_1 = require("../error/errors");
const AnotacionesRelevantes_1 = __importDefault(require("../models/AnotacionesRelevantes"));
const responses_1 = require("../utils/responses");
class AnotacionesRelevantesController {
    static editarAnotacionByAlumnoId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { detalle, fecha, alumnoId, issuer } = req.body;
                const response = yield AnotacionesRelevantes_1.default.editarAnotacionByAlumnoId({ nivel, year, detalle, fecha, alumnoId, issuer });
                if (response.upsertedCount) {
                    return res.send((0, responses_1.responseOk)(null));
                }
                else {
                    return res.send((0, responses_1.responseError)('no se pudo editar la anotación'));
                }
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static eliminarAnotacionByAlumnoId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { alumnoId } = req.body;
                const response = yield AnotacionesRelevantes_1.default.eliminarAnotacionRelevanteByAlumnoId({ nivel, year, alumnoId });
                if (response.acknowledged) {
                    return res.send((0, responses_1.responseOk)(null));
                }
                else {
                    return res.send((0, responses_1.responseError)('no se pudo eliminar la anotación'));
                }
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = AnotacionesRelevantesController;
