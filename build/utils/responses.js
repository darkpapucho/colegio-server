"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseError = exports.responseOk = void 0;
const responseOk = (payload) => {
    return { ok: true, payload };
};
exports.responseOk = responseOk;
const responseError = (message) => {
    return { ok: false, message };
};
exports.responseError = responseError;
