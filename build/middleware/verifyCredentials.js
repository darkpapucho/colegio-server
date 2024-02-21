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
exports.verifyCredentials = void 0;
const jwt_1 = require("../utils/jwt");
const global_1 = require("../utils/global");
const enums_1 = require("../error/enums");
const errors_1 = require("../error/errors");
const user_1 = require("../models/user");
const mongodb_1 = require("mongodb");
const verifyCredentials = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.get('Token');
    try {
        const { nivel } = (0, global_1.extractNivelYearFromHeaders)(req);
        console.log({ nivel });
        (0, global_1.assert)(token != undefined, enums_1.ErrorMessages.INVALID_REQUEST);
        const userID = (0, jwt_1.verifyToken)(token);
        const collectionName = `users${nivel}`;
        const user = yield user_1.User.getById({ _id: new mongodb_1.ObjectId(userID), collectionName });
        if (!user) {
            throw new Error(enums_1.ErrorMessages.INVALID_CREDENTIALS);
        }
        const refreshedToken = (0, jwt_1.signToken)({ _id: userID });
        res.setHeader('Token', refreshedToken);
        return next();
    }
    catch (error) {
        (0, errors_1.errorResponseHandler)(res, error);
    }
});
exports.verifyCredentials = verifyCredentials;
