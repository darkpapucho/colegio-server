"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const periodosDates_1 = require("../vars/periodosDates");
function convertDateToPeriodo(date) {
    if (date.getTime() >= new Date(periodosDates_1.primerPeriodoStart).getTime() && date.getTime() <= new Date(periodosDates_1.primerPeriodoEnd).getTime()) {
        return 'primerPeriodo';
    }
    else if (date.getTime() >= new Date(periodosDates_1.segundoPeriodoStart).getTime() && date.getTime() <= new Date(periodosDates_1.segundoPeriodoEnd).getTime()) {
        return 'segundoPeriodo';
    }
    else if (date >= new Date(periodosDates_1.tercerPeriodoStart) && date <= new Date(periodosDates_1.tercerPeriodoEnd)) {
        return 'tercerPeriodo';
    }
    else if (date >= new Date(periodosDates_1.cuartoPeriodoStart) && date <= new Date(periodosDates_1.cuartoPeriodoEnd)) {
        return 'cuartoPeriodo';
    }
    else {
        console.log('default');
        return 'primerPeriodo';
    }
}
exports.default = convertDateToPeriodo;
