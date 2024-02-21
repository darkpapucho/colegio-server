"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNivelYearFromHeaders = exports.assertSeccion = exports.assertGrado = exports.assert = void 0;
const enums_1 = require("../error/enums");
const enums_2 = require("../types/enums");
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
exports.assert = assert;
function assertYear(year) {
    if (enums_2.VALID_YEARS.includes(year))
        return year;
    else
        throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
}
function assertNivel(nivel) {
    if (enums_2.VALID_NIVELES.includes(nivel))
        return;
    else
        throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
}
function assertGrado(grado) {
    if (enums_2.VALID_GRADOS.includes(grado))
        return;
    else
        throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
}
exports.assertGrado = assertGrado;
function assertSeccion(seccion) {
    if (enums_2.VALID_SECCIONES.includes(seccion))
        return;
    else
        throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
}
exports.assertSeccion = assertSeccion;
function extractNivelYearFromHeaders(request) {
    const nivel = request.get('nivel');
    const year = request.get('year');
    if (!year || !nivel)
        throw new Error(enums_1.ErrorMessages.INVALID_REQUEST);
    const año = year;
    assertYear(año);
    assertNivel(nivel);
    return { nivel, year: año };
}
exports.extractNivelYearFromHeaders = extractNivelYearFromHeaders;
