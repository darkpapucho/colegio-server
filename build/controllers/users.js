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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const responses_1 = require("../utils/responses");
const errors_1 = require("../error/errors");
const loginProcess_1 = require("../utils/loginProcess");
const jwt_1 = require("../utils/jwt");
const user_1 = require("../models/user");
const global_1 = require("../utils/global");
const enums_1 = require("../error/enums");
const bcrypt_1 = require("bcrypt");
const hashPassword_1 = require("../utils/hashPassword");
class UserControllers {
    static resetProfesorPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nivel } = (0, global_1.extractNivelYearFromHeaders)(req);
                const { dni, userId } = req.body;
                console.log({ nivel, dni, userId });
                const newPassword = yield (0, hashPassword_1.hashPassword)('' + dni);
                const response = yield user_1.User.resetProfesorPassword({ nivel, newPassword, userId });
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
    static loginProfesor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password, nivel, year } = req.body;
                const usersCollectionName = `users${nivel}`;
                const empleadosCollectionName = `empleados${nivel}${year}`;
                const userCredentials = yield user_1.User.getByUsername({ collectionName: usersCollectionName, username });
                (0, global_1.assert)(userCredentials != null, enums_1.ErrorMessages.INVALID_CREDENTIALS);
                //validation of the password:
                const isValidPassword = yield (0, bcrypt_1.compare)(password, userCredentials.password);
                (0, global_1.assert)(isValidPassword, enums_1.ErrorMessages.INVALID_CREDENTIALS);
                //fetch profesor:
                const profesorInfo = yield user_1.User.getProfesorInfo({ collectionName: empleadosCollectionName, userId: userCredentials._id.toString() });
                (0, global_1.assert)(profesorInfo != null, enums_1.ErrorMessages.INVALID_CREDENTIALS);
                const token = (0, jwt_1.signToken)({ _id: userCredentials._id.toString() });
                res.status(200).send((0, responses_1.responseOk)({ profesor: profesorInfo, token }));
            }
            catch (err) {
                (0, errors_1.errorResponseHandler)(res, err);
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //extract data from the request
                const { usersCollectionName, empleadosCollectionName, username, password } = (0, loginProcess_1.getLoginRequestData)(req);
                //fetch user from database
                const userCredentials = yield user_1.User.getByUsername({ collectionName: usersCollectionName, username });
                (0, global_1.assert)(userCredentials != null, enums_1.ErrorMessages.INVALID_CREDENTIALS);
                //validation of the password
                const isValidPassword = yield (0, bcrypt_1.compare)(password, userCredentials.password);
                (0, global_1.assert)(isValidPassword, enums_1.ErrorMessages.INVALID_CREDENTIALS);
                //fetch user info from database
                const userInfo = yield user_1.User.getInfo({ collectionName: empleadosCollectionName, userId: userCredentials._id });
                (0, global_1.assert)(userInfo != null, enums_1.ErrorMessages.INVALID_CREDENTIALS);
                const token = (0, jwt_1.signToken)({ _id: userCredentials._id.toString() });
                // const token = signToken({ _id: 'cristhiam' })
                return res.status(200).send((0, responses_1.responseOk)({ userInfo, token }));
            }
            catch (error) {
                return (0, errors_1.errorResponseHandler)(res, error);
            }
        });
    }
    static verify(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.send('success');
        });
    }
}
exports.UserControllers = UserControllers;
