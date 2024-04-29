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
const bcrypt_1 = require("bcrypt");
const enums_1 = require("../error/enums");
const errors_1 = require("../error/errors");
const empleado_1 = __importDefault(require("../models/empleado"));
const user_1 = require("../models/user");
const global_1 = require("../utils/global");
const responses_1 = require("../utils/responses");
const validators_1 = require("../utils/validators");
class EmpleadoControllers {
    static changeProfesorPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { userId, newPassword, currentPassword } = req.body;
                //confirmPassword
                const userInfo = yield user_1.User.getById({ nivel, _id: userId });
                (0, global_1.assert)(userInfo, enums_1.ErrorMessages.INVALID_CREDENTIALS);
                const result = yield (0, bcrypt_1.compare)(currentPassword, userInfo.password);
                if (!result)
                    return res.send((0, responses_1.responseError)(enums_1.ErrorMessages.INCORRECT_PASSWORD));
                const response = yield empleado_1.default.updateProfesorPassword({ userId, newPassword, nivel });
                if (!response.acknowledged || !response.modifiedCount) {
                    return res.send((0, responses_1.responseError)(enums_1.ErrorMessages.OPERATION_NOT_COMPLETED));
                }
                return res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static updateProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const profesor = req.body.profesor;
                //TODO: assertProfesor
                yield empleado_1.default.updateProfesor({ nivel, year, profesor });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static fetchProfesores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const profesores = yield empleado_1.default.fetchProfesores({ nivel, year });
                res.send((0, responses_1.responseOk)(profesores));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static crearProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const data = req.body; //assert data:ProfesorData
                (0, validators_1.assertIsProfesorData)(data);
                const user = yield user_1.User.getByUsername({ collectionName: `users${nivel}`, username: '' + data.dni });
                if (user !== null)
                    throw new Error(enums_1.ErrorMessages.USER_ALREADY_EXISTS);
                const response = yield user_1.User.crearNuevoUsuarioProfesor({ nivel, dni: data.dni });
                if (!response.insertedId)
                    throw new Error('Error creando nuevo profesor');
                const response2 = yield empleado_1.default.crearProfesor({ nivel, year, userId: response.insertedId, data });
                if (!response2.insertedId)
                    throw new Error('Error creando nuevo profesor');
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = EmpleadoControllers;
