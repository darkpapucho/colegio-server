"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToLocalDatePeru = void 0;
function convertToLocalDatePeru(date) {
    if (!date)
        return '';
    return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
exports.convertToLocalDatePeru = convertToLocalDatePeru;
