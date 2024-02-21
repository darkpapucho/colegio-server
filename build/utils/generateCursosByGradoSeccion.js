"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generadorCursos = void 0;
const generadorCursos = (nivel, grado) => {
    let cursos = {};
    if (nivel === 'primaria') {
        cursos = { arteCultura: 1, cienciaTecnologia: 1, comunicacion: 1, educacionFisica: 1, ingles: 1, matematica: 1, personalSocial: 1, religion: 1, competenciasTransversales: 1, tardanzas: 1, inasistencias: 1, conclusionesDescriptivas: 1 };
    }
    else if (nivel === 'inicial') {
        if (grado === 'Grupo 5 años') {
            cursos = {
                cienciaTecnologia: 1,
                comunicacion: 1,
                matematica: 1,
                personalSocial: 1,
                psicomotriz: 1,
                competenciasTransversales: 1,
                tardanzas: 1,
                inasistencias: 1,
                conclusionesDescriptivas: 1,
                ingles: 1,
            };
        }
        else {
            cursos = { cienciaTecnologia: 1, comunicacion: 1, matematica: 1, personalSocial: 1, psicomotriz: 1, tardanzas: 1, inasistencias: 1, conclusionesDescriptivas: 1 };
        }
    }
    return cursos;
};
exports.generadorCursos = generadorCursos;
