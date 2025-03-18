"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNumberToMonthName = exports.getPeriodoEndDate = exports.getPeriodoStartDate = exports.cuartoPeriodoEnd = exports.cuartoPeriodoStart = exports.tercerPeriodoEnd = exports.tercerPeriodoStart = exports.segundoPeriodoEnd = exports.segundoPeriodoStart = exports.primerPeriodoEnd = exports.primerPeriodoStart = void 0;
const enums_1 = require("../error/enums");
const calendario_1 = require("../utils/calendario");
exports.primerPeriodoStart = '03-03-2024'; //MM-DD-YYYY
exports.primerPeriodoEnd = '05-09-2024';
exports.segundoPeriodoStart = '05-12-2024';
exports.segundoPeriodoEnd = '07-18-2024';
exports.tercerPeriodoStart = '08-04-2024';
exports.tercerPeriodoEnd = '10-10-2024';
exports.cuartoPeriodoStart = '10-13-2024';
exports.cuartoPeriodoEnd = '12-19-2024';
function getPeriodoStartDate(periodo) {
    switch (periodo) {
        case 'primerPeriodo':
            return exports.primerPeriodoStart;
        case 'segundoPeriodo':
            return exports.segundoPeriodoStart;
        case 'tercerPeriodo':
            return exports.tercerPeriodoStart;
        case 'cuartoPeriodo':
            return exports.cuartoPeriodoStart;
        default:
            throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
    }
}
exports.getPeriodoStartDate = getPeriodoStartDate;
function getPeriodoEndDate(periodo) {
    switch (periodo) {
        case 'primerPeriodo':
            return exports.primerPeriodoEnd;
        case 'segundoPeriodo':
            return exports.segundoPeriodoEnd;
        case 'tercerPeriodo':
            return exports.tercerPeriodoEnd;
        case 'cuartoPeriodo':
            return exports.cuartoPeriodoEnd;
        default:
            throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
    }
}
exports.getPeriodoEndDate = getPeriodoEndDate;
function convertNumberToMonthName(monthNumber) {
    if (monthNumber < 0 || monthNumber > 11)
        throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
    return calendario_1.MONTHS_YEAR[monthNumber];
}
exports.convertNumberToMonthName = convertNumberToMonthName;
