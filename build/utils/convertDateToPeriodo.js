"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const periodosDates_1 = require("../vars/periodosDates");
function convertDateToPeriodo(date) {
    const dateTime = date.getTime();
    if (dateTime >= new Date(periodosDates_1.primerPeriodoStart).getTime() && dateTime <= new Date(periodosDates_1.primerPeriodoEnd).getTime()) {
        return 'primerPeriodo';
    }
    else if (dateTime >= new Date(periodosDates_1.segundoPeriodoStart).getTime() && dateTime <= new Date(periodosDates_1.segundoPeriodoEnd).getTime()) {
        return 'segundoPeriodo';
    }
    else if (dateTime >= new Date(periodosDates_1.tercerPeriodoStart).getTime() && dateTime <= new Date(periodosDates_1.tercerPeriodoEnd).getTime()) {
        return 'tercerPeriodo';
    }
    else if (dateTime >= new Date(periodosDates_1.cuartoPeriodoStart).getTime() && dateTime <= new Date(periodosDates_1.cuartoPeriodoEnd).getTime()) {
        return 'cuartoPeriodo';
    }
    else {
        return 'primerPeriodo';
    }
}
exports.default = convertDateToPeriodo;
