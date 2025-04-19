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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const mongodb_1 = require("mongodb");
const db_1 = require("../db");
class EmpleadoControllers {
    static deleteAnuncioProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { anuncioId, profesorId } = req.body;
                yield empleado_1.default.deleteAnuncioProfesor({ nivel, year, profesorId, anuncioId });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static agregarAnuncioProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { date, title, content, profesorId, salones } = req.body;
                const anuncioId = yield empleado_1.default.agregarAnuncioProfesor({ nivel, year, date, title, content, profesorId, salones });
                return res.send((0, responses_1.responseOk)(anuncioId));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static eliminarHorarioCell(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { startTime, endTime, curso, salon, profesorId } = req.body;
                const response = yield empleado_1.default.deleteHorarioCell({ nivel, year, startTime, endTime, curso, salon, profesorId });
                if (response.modifiedCount == 0) {
                    return res.send((0, responses_1.responseError)('no se pudo elininar del horario'));
                }
                return res.send((0, responses_1.responseOk)(false));
            }
            catch (err) {
                return (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static agregarHorarioCell(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { startTime, endTime, profesorId, curso, salon } = req.body;
                yield empleado_1.default.agregarHorarioCell({ startTime, endTime, profesorId, curso, salon, nivel, year });
                const response = yield empleado_1.default.fetchProfesorHorario({ nivel, year, profesorId });
                res.send((0, responses_1.responseOk)((response === null || response === void 0 ? void 0 : response.horario) ? response === null || response === void 0 ? void 0 : response.horario : []));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static deleteProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { userId } = req.body;
                yield empleado_1.default.deleteProfesor({ nivel, year, userId });
                yield user_1.User.deleteUser({ userId, nivel });
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static changeProfesorPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { userId, newPassword, currentPassword } = req.body;
                //confirmPassword
                const userInfo = yield user_1.User.getById({ nivel, _id: new mongodb_1.ObjectId(userId) });
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
                const _a = req.body, { issuer } = _a, profesorData = __rest(_a, ["issuer"]); //assert data:ProfesorData
                //CHECK THAT NO USER EXIST WITH USERNAME = PROFESOR.DNI
                const user = yield user_1.User.getByUsername({ collectionName: `users${nivel}`, username: '' + profesorData.dni });
                if (user !== null)
                    throw new Error(enums_1.ErrorMessages.USER_ALREADY_EXISTS);
                //create new user for the profesor
                const session = db_1.mongoClient.startSession();
                session.startTransaction();
                const response = yield user_1.User.crearNuevoUsuarioProfesor({ nivel, dni: '' + profesorData.dni, session });
                if (!response.insertedId) {
                    yield session.abortTransaction();
                    session.endSession();
                    throw new Error('Error creando nuevo profesor');
                }
                const newProfesor = Object.assign(Object.assign({}, profesorData), { userId: response.insertedId.toString(), rol: 'profesor' });
                (0, validators_1.assertIsProfesorData)(profesorData);
                //agregamos el campo anuncios a la hora de crear al profesor
                newProfesor['anuncios'] = [];
                newProfesor['horario'] = [];
                const response2 = yield empleado_1.default.crearProfesor({ nivel, year, newProfesor, session });
                if (!response2.insertedId) {
                    yield session.abortTransaction();
                    session.endSession();
                    throw new Error('Error creando nuevo profesor');
                }
                yield session.commitTransaction();
                session.endSession();
                res.send((0, responses_1.responseOk)(null));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
}
exports.default = EmpleadoControllers;
