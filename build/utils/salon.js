"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSalonToIndex = exports.ALL_SALONES = void 0;
exports.ALL_SALONES = [
    'Grupo 3 años A',
    'Grupo 3 años B',
    'Grupo 3 años C',
    'Grupo 4 años A',
    'Grupo 4 años B',
    'Grupo 4 años C',
    'Grupo 5 años A',
    'Grupo 5 años B',
    'Grupo 5 años C',
    'PRIMERO A',
    'PRIMERO B',
    'PRIMERO C',
    'SEGUNDO A',
    'SEGUNDO B',
    'SEGUNDO C',
    'TERCERO A',
    'TERCERO B',
    'TERCERO C',
    'CUARTO A',
    'CUARTO B',
    'CUARTO C',
    'QUINTO A',
    'QUINTO B',
    'QUINTO C',
    'SEXTO A',
    'SEXTO B',
    'SEXTO C',
];
function convertSalonToIndex(salon) {
    return exports.ALL_SALONES.findIndex((record) => record == salon);
}
exports.convertSalonToIndex = convertSalonToIndex;
