"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastMonthToEvaluatePensiones = void 0;
const periodosDates_1 = require("../vars/periodosDates");
//0-11;
function getLastMonthToEvaluatePensiones() {
    const currentDate = new Date();
    if (currentDate >= new Date(periodosDates_1.segundoPeriodoStart) && currentDate < new Date(periodosDates_1.tercerPeriodoStart)) {
        return 4;
    }
    else if (currentDate >= new Date(periodosDates_1.tercerPeriodoStart) && currentDate < new Date(periodosDates_1.cuartoPeriodoStart)) {
        return 6;
    }
    else if (currentDate >= new Date(periodosDates_1.cuartoPeriodoStart) && currentDate < new Date(periodosDates_1.cuartoPeriodoEnd)) {
        return 9;
    }
    else {
        return 12;
    }
}
exports.getLastMonthToEvaluatePensiones = getLastMonthToEvaluatePensiones;
