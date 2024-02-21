"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoginRequestData = void 0;
const global_1 = require("./global");
const enums_1 = require("../error/enums");
const getLoginRequestData = (request) => {
    const { username, password } = request.body;
    const { nivel, year } = (0, global_1.extractNivelYearFromHeaders)(request);
    (0, global_1.assert)(username && password && nivel && year, enums_1.ErrorMessages.INVALID_REQUEST);
    const usersCollectionName = `users${nivel}`;
    const empleadosCollectionName = `empleados${nivel}${year}`;
    return { usersCollectionName, empleadosCollectionName, username, password };
};
exports.getLoginRequestData = getLoginRequestData;
