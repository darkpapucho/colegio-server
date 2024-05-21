"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const periodosDates_1 = require("../vars/periodosDates");
function convertDateToPeriodo(date) {
    let periodo = 'primerPeriodo';
    if (date >= new Date(periodosDates_1.primerPeriodoStart) && date <= new Date(periodosDates_1.primerPeriodoEnd)) {
        periodo = 'primerPeriodo';
    }
    else if (date >= new Date(periodosDates_1.segundoPeriodoStart) && date <= new Date(periodosDates_1.segundoPeriodoEnd)) {
        periodo = 'segundoPeriodo';
    }
    else if (date >= new Date(periodosDates_1.tercerPeriodoStart) && date <= new Date(periodosDates_1.tercerPeriodoEnd)) {
        periodo = 'tercerPeriodo';
    }
    else if (date >= new Date(periodosDates_1.cuartoPeriodoStart) && date <= new Date(periodosDates_1.cuartoPeriodoEnd)) {
        periodo = 'cuartoPeriodo';
    }
    return periodo;
}
exports.default = convertDateToPeriodo;
