"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastMonthToEvaluatePensiones = void 0;
//0-11;
function getLastMonthToEvaluatePensiones(currentPeriodo) {
    switch (currentPeriodo) {
        case 'primerPeriodo':
            return 5;
        case 'segundoPeriodo':
            return 7;
        case 'tercerPeriodo':
            return 10;
        case 'cuartoPeriodo':
        default:
            return 12;
    }
}
exports.getLastMonthToEvaluatePensiones = getLastMonthToEvaluatePensiones;
