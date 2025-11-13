"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPromedioCurso = exports.calcularPonderado = void 0;
function calcularPonderado(cursos) {
    const promedios = [];
    for (let curso in cursos) {
        promedios.push(calcularPromedioCurso(cursos[curso]));
    }
    // promedios.push(calcularPromedioCurso(conducta))
    const ponderado = +(promedios.reduce((acc, curr) => acc + curr, 0) / promedios.length).toFixed(2);
    return ponderado;
}
exports.calcularPonderado = calcularPonderado;
function calcularPromedioCurso(notas) {
    const numPeriodos = notas.reduce((acc, curr) => {
        if (curr != 0) {
            acc++;
        }
        return acc;
    }, 0);
    if (!numPeriodos)
        return 0;
    return +((notas[0] + notas[1] + notas[2] + notas[3]) / numPeriodos).toFixed(2);
}
exports.calcularPromedioCurso = calcularPromedioCurso;
