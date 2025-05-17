"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../generarBoletaNotas/utils/utils");
const utils_2 = require("./utils");
function generateLibretaPrimariaPDF({ doc, tutor, nivel, grado, seccion, year, notas, cursosSalon, periodo, }) {
    doc.addPage();
    (0, utils_2.AddHeaders)({ doc, tutor, nivel, year, grado, seccion, alumno: notas.alumno });
    (0, utils_2.addNotas)({ doc, notas, cursosSalon, periodo });
    doc.addPage();
    (0, utils_1.conclusionesDescriptivasTabla)({ document: doc, conclusionesDescriptivas: notas.conclusionesDescriptivas });
    (0, utils_1.resumenAsistencias)({ document: doc, inasistencias: notas.inasistencias, tardanzas: notas.tardanzas });
    (0, utils_1.escalaCalificaciones)(doc);
    (0, utils_1.firmas)({ document: doc });
}
exports.default = generateLibretaPrimariaPDF;
