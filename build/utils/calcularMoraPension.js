"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastDayFromMonth = void 0;
function getLastDayFromMonth({ year, month }) {
    const date = new Date(year, month, 0);
    return date.getDate();
}
exports.getLastDayFromMonth = getLastDayFromMonth;
function calcularMoraPension(monthToPay) {
    const currentYear = new Date().getFullYear();
    const precioMoraDia = 1; //precio de mora por dia
    //use month index from 0 to 11
    const currentMonth = new Date().getMonth(); //getMonth returns month index starting from 0
    const currentDay = new Date().getDate();
    let moraDays = 0;
    // contabilizar la mora a partir del dia 10 del mes siguiente mes a pagar
    let monthDelta = currentMonth - monthToPay;
    // if (monthDelta == 1 && currentDay > 10) {
    //   return (moraDays += (currentDay - 10) * precioMoraDia); //calcular mora por dias de atraso del mes siguiente
    // }
    for (let p = monthDelta; p > 0; p--) {
        if (p == monthDelta) {
            if (monthDelta > 1) {
                moraDays += currentDay;
            }
            else {
                const delta = currentDay - 10 < 0 ? 0 : currentDay - 10;
                moraDays += delta;
            }
        }
        if (p > 1 && p < monthDelta) {
            const lastDay = getLastDayFromMonth({ year: currentYear, month: currentMonth + 1 });
            moraDays += lastDay;
        }
        if (p == 1) {
            if (monthDelta == 1) {
                const delta = currentDay - 10 < 0 ? 0 : currentDay - 10;
                moraDays += delta;
            }
            else {
                const lastDay = getLastDayFromMonth({ year: currentYear, month: currentMonth + 1 });
                moraDays += lastDay - 10;
            }
        }
    }
    return moraDays * precioMoraDia;
}
exports.default = calcularMoraPension;
