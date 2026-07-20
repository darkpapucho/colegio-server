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
const Asistencia_1 = __importDefault(require("../models/Asistencia"));
const responses_1 = require("../utils/responses");
const errors_1 = require("../error/errors");
class AsistenciaController {
    static marcarAsistencia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                console.log({ nivel, year });
                const { dayId, timestamp, userId } = req.body;
                const response = yield Asistencia_1.default.marcarAsistencia({ userId, dayId, timestamp });
                if (response.acknowledged && response.modifiedCount == 1) {
                    res.send((0, responses_1.responseOk)(null));
                    return;
                }
                return res.send((0, responses_1.responseError)('no se pudo marcar la asistencia'));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = AsistenciaController;
