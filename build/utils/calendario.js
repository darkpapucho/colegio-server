"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthsBetween = exports.MONTHS_YEAR = void 0;
const periodosDates_1 = require("../vars/periodosDates");
exports.MONTHS_YEAR = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
function getMonthsBetween(beginDate, endDate, keyWord) {
    const betweenMonths = [];
    for (let i = beginDate.getMonth() + 1; i < endDate.getMonth(); i++) {
        betweenMonths.push({ $eq: [keyWord, (0, periodosDates_1.convertNumberToMonthName)(i)] });
    }
    return betweenMonths;
}
exports.getMonthsBetween = getMonthsBetween;
