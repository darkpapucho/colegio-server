"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tablaNotasDatosPrimaria = exports.tablaNotasCamposPrimaria = exports.tablaNotasEstructuraPrimaria = exports.tableHeadData = exports.tableHead = void 0;
const constants_1 = require("../../../vars/constants");
const utils_1 = require("./utils");
const vars_1 = require("./vars");
function tableHead(document) {
    document.rect(50, 70, 330, 105).stroke();
    document.rect(50, 70, 120, 105).fillOpacity(0.5).fillAndStroke(vars_1.FILL_COLOR, vars_1.BORDER_COLOR);
    document.fillOpacity(1);
    let count = 0;
    for (let i = 0; i < 6; i++) {
        document
            .moveTo(50, 85 + count)
            .lineTo(380, 85 + count)
            .stroke();
        count += 15;
    }
    document.moveTo(170, 70).lineTo(170, 175).stroke();
}
exports.tableHead = tableHead;
function tableHeadData({ document, nivel, grado, seccion, nombreCompleto }) {
    document.fill(vars_1.HEADER_FONT_COLOR);
    document.font(vars_1.BOLD_FONT);
    let count = 0;
    for (const header of vars_1.BOLETA_NOTA_HEADERS) {
        document.fontSize(8).text(header, 50, 75 + count, { width: 115, align: 'right' });
        count += 15;
    }
    count = 0;
    document.fill(vars_1.HEADER_COLOR_CONTENT).font(vars_1.NORMAL_FONT);
    const BOLETA_NOTA_HEADERS_CONTENT = [vars_1.DRE, vars_1.UGEL, nivel, vars_1.NOMBRE_COLEGIO, grado, seccion, nombreCompleto];
    for (const content of BOLETA_NOTA_HEADERS_CONTENT) {
        document.fontSize(8).text(content, 175, 75 + count, { width: 205, align: 'left' });
        count += 15;
    }
}
exports.tableHeadData = tableHeadData;
function tablaNotasEstructuraPrimaria(document) {
    document.rect(vars_1.MARGIN_LEFT, 200, vars_1.TABLE_NOTAS_WIDTH, vars_1.TABLE_NOTAS_HEIGHT).stroke();
    document.rect(vars_1.MARGIN_LEFT, 200, vars_1.TABLE_NOTAS_WIDTH, vars_1.NOTAS_TABLE_HEADER_HEIGHT).fillOpacity(0.5).fillAndStroke(vars_1.FILL_COLOR, vars_1.BORDER_COLOR);
    document
        .rect(vars_1.MARGIN_LEFT, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT, vars_1.CURSO_CELDA_WIDTH, constants_1.NUMERO_COMPETENCIAS_PRIMARIA * vars_1.NOTA_CELDA_HEIGHT)
        .fillOpacity(0.5)
        .fillAndStroke(vars_1.FILL_COLOR, vars_1.BORDER_COLOR); //BORDER_COLOR
    //LINEAS HORIZONTALES
    document.fillOpacity(1);
    document
        .moveTo(vars_1.MARGIN_LEFT, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT)
        .lineTo(vars_1.MARGIN_LEFT + vars_1.TABLE_NOTAS_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT)
        .stroke();
    //LIVENAS VERTICALES (TABLE HEIGHT)
    document
        .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, 200)
        .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, 200 + vars_1.TABLE_NOTAS_HEIGHT)
        .stroke();
    document
        .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH, 200)
        .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH, 200 + vars_1.TABLE_NOTAS_HEIGHT)
        .stroke();
    let count = 0;
    for (let i = 0; i < 3; i++) {
        document
            .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH + count, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT / 2)
            .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH + count, 200 + vars_1.TABLE_NOTAS_HEIGHT)
            .stroke();
        document
            .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH + count + 3 * vars_1.NOTA_CELDA_WIDTH, 200)
            .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH + count + 3 * vars_1.NOTA_CELDA_WIDTH, 200 + vars_1.TABLE_NOTAS_HEIGHT)
            .stroke();
        count += 30;
    }
    //LINEA QUE DIVIDE EN DOS CALIFICATIVO POR PERIODOS
    document
        .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT / 2)
        .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 4 * vars_1.NOTA_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT / 2)
        .stroke();
    //LINEAS HORIZONTALES POR COMPETENCIAS
    count = 0;
    for (let i = 0; i < constants_1.NUMERO_COMPETENCIAS_PRIMARIA - 1; i++) {
        document
            .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + vars_1.NOTA_CELDA_HEIGHT + count)
            .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 5 * vars_1.NOTA_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + vars_1.NOTA_CELDA_HEIGHT + count)
            .stroke();
        count += vars_1.NOTA_CELDA_HEIGHT;
    }
    //lineas horizontales por curso
    let initialHeight = 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT;
    for (const curso of constants_1.CURSOS_PRIMARIA_BOLETA_NOTAS) {
        document
            .moveTo(vars_1.MARGIN_LEFT, initialHeight + curso.competencias.length * vars_1.NOTA_CELDA_HEIGHT)
            .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, initialHeight + curso.competencias.length * vars_1.NOTA_CELDA_HEIGHT)
            .stroke();
        document
            .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH * 5, initialHeight + curso.competencias.length * vars_1.NOTA_CELDA_HEIGHT)
            .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH * 6 + vars_1.CONCLUSION_DESCRIPTIVA_CELDA_WIDTH, initialHeight + curso.competencias.length * vars_1.NOTA_CELDA_HEIGHT)
            .stroke();
        initialHeight += curso.competencias.length * vars_1.NOTA_CELDA_HEIGHT;
    }
}
exports.tablaNotasEstructuraPrimaria = tablaNotasEstructuraPrimaria;
function tablaNotasCamposPrimaria(document) {
    let count = 0;
    count = 0;
    document.fill(vars_1.TEXT_COLOR).font(vars_1.NORMAL_FONT);
    //competencias de los cursos
    for (const curso of constants_1.CURSOS_PRIMARIA_BOLETA_NOTAS) {
        for (const competencia of curso.competencias) {
            document.fontSize(7).text(competencia, 150, 235 + count, { width: 160, align: 'left' });
            count += vars_1.NOTA_CELDA_HEIGHT;
        }
    }
    //encabezados de la tabla
    document.fill(vars_1.HEADER_FONT_COLOR).font(vars_1.BOLD_FONT);
    document.fontSize(8).text('ÁREA CURRICULAR', 50, 213, { width: 95, align: 'center' });
    document.fontSize(12).text('COMPETENCIAS', 145, 210, { width: 170, align: 'center' });
    document.fontSize(7).text('CALIFICATIVO POR PERIODO', 315, 205, { width: 120, align: 'center' });
    document.fontSize(7).text('1', 315, 220, { width: 30, align: 'center' });
    document.fontSize(7).text('2', 345, 220, { width: 30, align: 'center' });
    document.fontSize(7).text('3', 375, 220, { width: 30, align: 'center' });
    document.fontSize(7).text('4', 405, 220, { width: 30, align: 'center' });
    document.fontSize(5).text('Calif. anual de comp.', 435, 208, { width: 30, align: 'center' });
    document.fontSize(5).text('Calif. anual de área.', 465, 208, { width: 30, align: 'center' });
    document.fontSize(7).text('Conclusión descriptiva', 495, 210, { width: 56, align: 'center' });
    //nombres de los cursos
    document.fontSize(8);
    count = 0;
    for (const curso of constants_1.CURSOS_PRIMARIA_BOLETA_NOTAS) {
        if (!constants_1.ESPACIOS_ENTRE_CURSOS_PRIMARIA[curso.key])
            throw new Error('ERROR PROCESANDO LIBRETA DE NOTAS: CURSO INVÁLIDO');
        document.fontSize(8).text(curso.label, 52, 228 + constants_1.ESPACIOS_ENTRE_CURSOS_PRIMARIA[curso.key], { width: 91, align: 'center' });
    }
}
exports.tablaNotasCamposPrimaria = tablaNotasCamposPrimaria;
function tablaNotasDatosPrimaria({ document, cursos }) {
    document.fill(vars_1.TEXT_COLOR).font(vars_1.NORMAL_FONT);
    let count = 0;
    const PERIODOS = ['primerPeriodo', 'segundoPeriodo', 'tercerPeriodo', 'cuartoPeriodo'];
    for (const periodo of PERIODOS) {
        for (const CURSO_PRIMARIA of constants_1.CURSOS_PRIMARIA_BOLETA_NOTAS) {
            for (let i = 0; i < cursos[CURSO_PRIMARIA.key].numCompetencias; i++) {
                document
                    .fontSize(9)
                    .text(cursos[CURSO_PRIMARIA.key][periodo][i] ? cursos[CURSO_PRIMARIA.key][periodo][i] : ' ', 315 + vars_1.NOTA_CELDA_WIDTH * (0, utils_1.convertPeriodoKeyToIndex)(periodo), 237 + count, { width: 30, align: 'center' });
                count += vars_1.NOTA_CELDA_HEIGHT;
            }
        }
        count = 0;
    }
}
exports.tablaNotasDatosPrimaria = tablaNotasDatosPrimaria;
