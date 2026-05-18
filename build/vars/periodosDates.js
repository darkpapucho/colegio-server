"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMonthNameToMonthNumber1to12 = exports.convertNumberToMonthName = exports.getPeriodoEndDate = exports.getPeriodoStartDate = exports.cuartoPeriodoEnd = exports.cuartoPeriodoStart = exports.tercerPeriodoEnd = exports.tercerPeriodoStart = exports.segundoPeriodoEnd = exports.segundoPeriodoStart = exports.primerPeriodoEnd = exports.primerPeriodoStart = void 0;
const enums_1 = require("../error/enums");
const asistencia_1 = require("../types/asistencia");
const calendario_1 = require("../utils/calendario");
exports.primerPeriodoStart = '03-02-2026'; //MM-DD-YYYY
exports.primerPeriodoEnd = '05-08-2026';
exports.segundoPeriodoStart = '05-11-2026';
exports.segundoPeriodoEnd = '07-17-2026';
exports.tercerPeriodoStart = '08-03-2026';
exports.tercerPeriodoEnd = '10-09-2026';
exports.cuartoPeriodoStart = '10-12-2026';
exports.cuartoPeriodoEnd = '12-18-2026';
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
function parseMonthNameToMonthNumber1to12(monthName) {
    return asistencia_1.VALID_MONTHS.findIndex((month) => month === monthName.toLowerCase()) + 1;
}
exports.parseMonthNameToMonthNumber1to12 = parseMonthNameToMonthNumber1to12;
