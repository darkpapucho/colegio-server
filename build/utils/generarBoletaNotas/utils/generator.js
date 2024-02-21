"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarBoletasNotasInicial = exports.generarBoletasNotasPrimaria = void 0;
const inicial_1 = require("./inicial");
const primaria_1 = require("./primaria");
const utils_1 = require("./utils");
const generarBoletasNotasPrimaria = ({ document, registro, nivel }) => {
    const { estudiante, cursos, conclusionesDescriptivas, inasistencias, tardanzas } = registro;
    // const {personalSocial, educacionFisica,comunicacion, arteCultura, ingles, matematica, cienciaTecnologia, religion, competenciasTransversales} = cursos;
    // const notas = {personalSocial, educacionFisica,comunicacion, arteCultura, ingles, matematica, cienciaTecnologia, religion, competenciasTransversales};
    const { grado, seccion, nombreCompleto } = estudiante[0];
    (0, primaria_1.tableHead)(document);
    (0, primaria_1.tableHeadData)({ document, nivel, grado, seccion, nombreCompleto });
    (0, primaria_1.tablaNotasEstructuraPrimaria)(document);
    (0, primaria_1.tablaNotasCamposPrimaria)(document);
    (0, primaria_1.tablaNotasDatosPrimaria)({ document, cursos });
    // if(tipo==="anual"){
    //   tablaNotasPromedios(pdfDoc, notas,nivel,grado);
    // }
    (0, utils_1.tablaNotasPromedios)({ document, cursos, nivel, grado }); //modified
    (0, utils_1.conclusionesDescriptivasTabla)({ document: document, conclusionesDescriptivas });
    (0, utils_1.resumenAsistencias)({ document, inasistencias, tardanzas });
    (0, utils_1.escalaCalificaciones)(document);
    (0, utils_1.firmas)({ document });
};
exports.generarBoletasNotasPrimaria = generarBoletasNotasPrimaria;
const generarBoletasNotasInicial = ({ document, registro, nivel }) => {
    const { estudiante, cursos, conclusionesDescriptivas, inasistencias, tardanzas } = registro;
    const { grado, seccion, nombreCompleto } = estudiante[0];
    // if (grado === 'Grupo 5 años') {
    //   notas = { personalSocial, psicomotriz, comunicacion, matematica, cienciaTecnologia, competenciasTransversales };
    // } else {
    //   notas = { personalSocial, psicomotriz, comunicacion, matematica, cienciaTecnologia };
    // }
    (0, primaria_1.tableHead)(document);
    (0, primaria_1.tableHeadData)({ document, nivel, grado, seccion, nombreCompleto });
    (0, inicial_1.tablaNotasEstructuraInicial)({ document, grado });
    (0, inicial_1.tablaNotasCamposInicial)({ document, grado });
    (0, inicial_1.tablaNotasDatosInicial)({ document, cursos, grado });
    // if (tipo === 'anual') {
    //   tablaNotasPromedios(document, notas, nivel, grado);
    // }
    (0, utils_1.tablaNotasPromedios)({ document, cursos, nivel, grado }); //modified
    (0, utils_1.conclusionesDescriptivasTabla)({ document, conclusionesDescriptivas });
    (0, utils_1.resumenAsistencias)({ document, inasistencias, tardanzas });
    (0, utils_1.escalaCalificaciones)(document);
    (0, utils_1.firmas)({ document });
};
exports.generarBoletasNotasInicial = generarBoletasNotasInicial;
