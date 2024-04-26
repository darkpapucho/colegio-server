"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponseHandler = exports.assertIsError = void 0;
const enums_1 = require("./enums");
const responses_1 = require("../utils/responses");
const jsonwebtoken_1 = require("jsonwebtoken");
const mongodb_1 = require("mongodb");
function assertIsError(error) {
    if (error instanceof Error)
        return;
    console.log(error);
    throw new Error(enums_1.ErrorMessages.UNKNOWN_ERROR);
}
exports.assertIsError = assertIsError;
function errorResponseHandler(res, error) {
    console.log({ error });
    try {
        assertIsError(error);
        if (error instanceof mongodb_1.MongoServerError) {
            return res.status(501).send((0, responses_1.responseError)(enums_1.ErrorMessages.SERVER_ERROR));
        }
        else if (error.message === enums_1.ErrorMessages.INVALID_CREDENTIALS) {
            return res.status(401).send((0, responses_1.responseError)(error.message));
        }
        else if (error.message === enums_1.ErrorMessages.INVALID_REQUEST) {
            return res.status(400).send((0, responses_1.responseError)(error.message));
        }
        else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            console.log({ jwtMessage: error.message });
            return res.status(401).send((0, responses_1.responseError)(enums_1.ErrorMessages.INVALID_TOKEN));
        }
        else if (error.message === enums_1.ErrorMessages.USER_ALREADY_EXISTS) {
            return res.status(406).send((0, responses_1.responseError)(error.message));
        }
        else {
            console.log({ error });
            return res.status(500).send((0, responses_1.responseError)(enums_1.ErrorMessages.SERVER_ERROR));
        }
    }
    catch (err) {
        return res.status(500).send((0, responses_1.responseError)(enums_1.ErrorMessages.UNKNOWN_ERROR));
    }
}
exports.errorResponseHandler = errorResponseHandler;
