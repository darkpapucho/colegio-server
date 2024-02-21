"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tablaNotasDatosInicial = exports.tablaNotasCamposInicial = exports.tablaNotasEstructuraInicial = void 0;
const constants_1 = require("../../../vars/constants");
const utils_1 = require("./utils");
const vars_1 = require("./vars");
function tablaNotasEstructuraInicial({ document, grado }) {
    if (grado === 'Grupo 5 años') {
        let count = 0;
        document.rect(vars_1.MARGIN_LEFT, 200, vars_1.NOTAS_TABLE_WIDTH, vars_1.NOTAS_TABLE_HEADER_HEIGHT + constants_1.NUMERO_COMPETENCIAS_5_INICIAL * vars_1.NOTA_CELDA_HEIGHT).stroke(); //316+66 MARCO DEL RECTANGULO GRANDE
        document.rect(vars_1.MARGIN_LEFT, 200, vars_1.NOTAS_TABLE_WIDTH, vars_1.NOTAS_TABLE_HEADER_HEIGHT).fillOpacity(0.5).fillAndStroke(vars_1.FILL_COLOR, vars_1.BORDER_COLOR); //RELLENO DEL RECTANGULO HEADER
        document
            .rect(vars_1.MARGIN_LEFT, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT, vars_1.CURSO_CELDA_WIDTH, constants_1.NUMERO_COMPETENCIAS_5_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
            .fillOpacity(0.5)
            .fillAndStroke(vars_1.FILL_COLOR, vars_1.BORDER_COLOR);
        document.fillOpacity(1);
        document
            .moveTo(145, 200)
            .lineTo(145, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT)
            .stroke(vars_1.BORDER_COLOR); //primera columna
        document
            .moveTo(315, 200)
            .lineTo(315, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + constants_1.NUMERO_COMPETENCIAS_5_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
            .stroke(vars_1.BORDER_COLOR); //segunda columna
        for (let i = 0; i < 3; i++) {
            document
                .moveTo(345 + count, 215)
                .lineTo(345 + count, 215 + vars_1.NOTAS_TABLE_HEADER_HEIGHT / 2 + constants_1.NUMERO_COMPETENCIAS_5_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
                .stroke(vars_1.BORDER_COLOR); //3 columnas calificativo por periodo, se van corriendo 30 a la derecha
            document
                .moveTo(345 + count + vars_1.NOTA_CELDA_WIDTH * 3, 200)
                .lineTo(345 + count + vars_1.NOTA_CELDA_WIDTH * 3, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + constants_1.NUMERO_COMPETENCIAS_5_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
                .stroke(vars_1.BORDER_COLOR); // 3 ultimas columnas, continua corriendo 30 a la derecha
            count += vars_1.NOTA_CELDA_WIDTH;
        }
        // linea q divide calificativo por periodo
        document
            .moveTo(315, 215)
            .lineTo(315 + vars_1.NOTA_CELDA_WIDTH * 4, 215)
            .stroke(vars_1.BORDER_COLOR);
        count = 0;
        //lineas horizontales de las competencias
        for (let i = 0; i < constants_1.NUMERO_COMPETENCIAS_5_INICIAL - 1; i++) {
            document
                .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + vars_1.NOTA_CELDA_HEIGHT + count) //145
                .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 5 * vars_1.NOTA_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + vars_1.NOTA_CELDA_HEIGHT + count) //315+150
                .stroke(vars_1.BORDER_COLOR);
            count += vars_1.NOTA_CELDA_HEIGHT;
        }
        //lineas horizontales de los cursos
        let initialHeight = 230;
        for (const curso of constants_1.CURSOS_INICIAL_5_BOLETA_NOTAS) {
            document
                .moveTo(vars_1.MARGIN_LEFT, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .stroke();
            document
                .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 5 * vars_1.NOTA_CELDA_WIDTH, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 5 * vars_1.NOTA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH + vars_1.CONCLUSION_DESCRIPTIVA_CELDA_WIDTH, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .stroke();
            initialHeight += vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length;
        }
    }
    else {
        let count = 0;
        document.rect(vars_1.MARGIN_LEFT, 200, vars_1.NOTAS_TABLE_WIDTH, vars_1.NOTAS_TABLE_HEADER_HEIGHT + constants_1.NUMERO_COMPETENCIAS_3_4_INICIAL * vars_1.NOTA_CELDA_HEIGHT).stroke(); //316+66 MARCO DEL RECTANGULO GRANDE
        document.rect(vars_1.MARGIN_LEFT, 200, vars_1.NOTAS_TABLE_WIDTH, vars_1.NOTAS_TABLE_HEADER_HEIGHT).fillOpacity(0.5).fillAndStroke(vars_1.FILL_COLOR, vars_1.BORDER_COLOR); //RELLENO DEL RECTANGULO HEADER
        document
            .rect(vars_1.MARGIN_LEFT, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT, vars_1.CURSO_CELDA_WIDTH, constants_1.NUMERO_COMPETENCIAS_3_4_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
            .fillOpacity(0.5)
            .fillAndStroke(vars_1.FILL_COLOR, vars_1.BORDER_COLOR);
        document.fillOpacity(1);
        document
            .moveTo(145, 200)
            .lineTo(145, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT)
            .stroke(vars_1.BORDER_COLOR); //primera columna
        document
            .moveTo(315, 200)
            .lineTo(315, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + constants_1.NUMERO_COMPETENCIAS_3_4_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
            .stroke(vars_1.BORDER_COLOR); //segunda columna
        for (let i = 0; i < 3; i++) {
            document
                .moveTo(345 + count, 215)
                .lineTo(345 + count, 215 + vars_1.NOTAS_TABLE_HEADER_HEIGHT / 2 + constants_1.NUMERO_COMPETENCIAS_3_4_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
                .stroke(vars_1.BORDER_COLOR); //3 columnas calificativo por periodo, se van corriendo 30 a la derecha
            document
                .moveTo(345 + count + vars_1.NOTA_CELDA_WIDTH * 3, 200)
                .lineTo(345 + count + vars_1.NOTA_CELDA_WIDTH * 3, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + constants_1.NUMERO_COMPETENCIAS_3_4_INICIAL * vars_1.NOTA_CELDA_HEIGHT)
                .stroke(vars_1.BORDER_COLOR); // 3 ultimas columnas, continua corriendo 30 a la derecha
            count += vars_1.NOTA_CELDA_WIDTH;
        }
        // linea q divide calificativo por periodo
        document
            .moveTo(315, 215)
            .lineTo(315 + vars_1.NOTA_CELDA_WIDTH * 4, 215)
            .stroke(vars_1.BORDER_COLOR);
        count = 0;
        //lineas horizontales de las competencias
        for (let i = 0; i < constants_1.NUMERO_COMPETENCIAS_3_4_INICIAL - 1; i++) {
            document
                .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + vars_1.NOTA_CELDA_HEIGHT + count) //145
                .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 5 * vars_1.NOTA_CELDA_WIDTH, 200 + vars_1.NOTAS_TABLE_HEADER_HEIGHT + vars_1.NOTA_CELDA_HEIGHT + count) //315+150
                .stroke(vars_1.BORDER_COLOR);
            count += vars_1.NOTA_CELDA_HEIGHT;
        }
        //lineas horizontales de los cursos
        let initialHeight = 230;
        for (const curso of constants_1.CURSOS_INICIAL_3_4_BOLETA_NOTAS) {
            document
                .moveTo(vars_1.MARGIN_LEFT, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .stroke();
            document
                .moveTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 5 * vars_1.NOTA_CELDA_WIDTH, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .lineTo(vars_1.MARGIN_LEFT + vars_1.CURSO_CELDA_WIDTH + vars_1.COMPETENCIA_CELDA_WIDTH + 5 * vars_1.NOTA_CELDA_WIDTH + vars_1.NOTA_CELDA_WIDTH + vars_1.CONCLUSION_DESCRIPTIVA_CELDA_WIDTH, initialHeight + vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length)
                .stroke();
            initialHeight += vars_1.NOTA_CELDA_HEIGHT * curso.competencias.length;
        }
    }
}
exports.tablaNotasEstructuraInicial = tablaNotasEstructuraInicial;
function tablaNotasCamposInicial({ document, grado }) {
    if (grado === 'Grupo 5 años') {
        let count = 0;
        document.font(vars_1.NORMAL_FONT).fill(vars_1.TEXT_COLOR);
        for (let curso of constants_1.CURSOS_INICIAL_5_BOLETA_NOTAS) {
            for (let i = 0; i < curso.competencias.length; i++) {
                document.fontSize(7).text(curso.competencias[i], 150, 235 + count, { width: 160, align: 'left' });
                count += vars_1.NOTA_CELDA_HEIGHT;
            }
        }
        //HEADERS
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
        for (const curso of constants_1.CURSOS_INICIAL_5_BOLETA_NOTAS) {
            if (!constants_1.ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key])
                throw new Error('ERROR PROCESANDO LIBRETA DE NOTAS: CURSO INVÁLIDO');
            document.fontSize(8).text(curso.label, 52, 228 + constants_1.ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key], { width: 91, align: 'center' });
        }
    }
    else {
        let count = 0;
        //imprimir todas las competencias de todos los cursos
        document.font(vars_1.NORMAL_FONT).fill(vars_1.TEXT_COLOR);
        for (const curso of constants_1.CURSOS_INICIAL_3_4_BOLETA_NOTAS) {
            for (let i = 0; i < curso.competencias.length; i++) {
                document.fontSize(7).text(curso.competencias[i], 150, 235 + count, { width: 160, align: 'left' });
                count += vars_1.NOTA_CELDA_HEIGHT;
            }
        }
        //HEADERS
        document.fill(vars_1.HEADER_FONT_COLOR).font(vars_1.BOLD_FONT);
        document.fontSize(8).text('ÁREA CURRICULAR', 50, 213, { width: 95, align: 'center' });
        document.fontSize(8).text('COMPETENCIAS', 145, 213, { width: 170, align: 'center' });
        document.fontSize(7).text('CALIFICATIVO POR PERIODO', 315, 205, { width: 120, align: 'center' });
        document.fontSize(7).text('1', 315, 220, { width: 30, align: 'center' });
        document.fontSize(7).text('2', 345, 220, { width: 30, align: 'center' });
        document.fontSize(7).text('3', 375, 220, { width: 30, align: 'center' });
        document.fontSize(7).text('4', 405, 220, { width: 30, align: 'center' });
        document.fontSize(5).text('Calif. anual de comp.', 435, 208, { width: 30, align: 'center' });
        document.fontSize(5).text('Calif. anual de área.', 465, 208, { width: 30, align: 'center' });
        document.fontSize(7).text('Conclusión descriptiva', 495, 210, { width: 56, align: 'center' });
        //nombres de los cursos
        for (const curso of constants_1.CURSOS_INICIAL_5_BOLETA_NOTAS) {
            if (!constants_1.ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key])
                throw new Error('ERROR PROCESANDO LIBRETA DE NOTAS: CURSO INVÁLIDO');
            document.fontSize(8).text(curso.label, 52, 228 + constants_1.ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key], { width: 91, align: 'center' });
        }
    }
}
exports.tablaNotasCamposInicial = tablaNotasCamposInicial;
//notas de los cursos
function tablaNotasDatosInicial({ document, cursos, grado }) {
    //inicial
    const PERIODOS = ['primerPeriodo', 'segundoPeriodo', 'tercerPeriodo', 'cuartoPeriodo'];
    document.fill(vars_1.TEXT_COLOR).font(vars_1.NORMAL_FONT);
    if (grado === 'Grupo 5 años') {
        let count = 0;
        for (const periodo of PERIODOS) {
            for (const CURSO_INICIAL_5 of constants_1.CURSOS_INICIAL_5_BOLETA_NOTAS) {
                for (let i = 0; i < cursos[CURSO_INICIAL_5.key].numCompetencias; i++) {
                    //una nota por cada competencia
                    document.fontSize(9).text(cursos[CURSO_INICIAL_5.key][periodo][i] ? cursos[CURSO_INICIAL_5.key][periodo][i] : ' ', 315 + vars_1.NOTA_CELDA_WIDTH * (0, utils_1.convertPeriodoKeyToIndex)(periodo), 237 + count, { width: 30, align: 'center' });
                    count += vars_1.NOTA_CELDA_HEIGHT;
                }
            }
            count = 0;
        }
    }
    else {
        let count = 0;
        for (const periodo of PERIODOS) {
            for (const CURSO_INICIAL_3_4 of constants_1.CURSOS_INICIAL_3_4_BOLETA_NOTAS) {
                for (let i = 0; i < cursos[CURSO_INICIAL_3_4.key].numCompetencias; i++) {
                    document.fontSize(9).text(cursos[CURSO_INICIAL_3_4.key][periodo][i] ? cursos[CURSO_INICIAL_3_4.key][periodo][i] : ' ', 315 + vars_1.NOTA_CELDA_WIDTH * (0, utils_1.convertPeriodoKeyToIndex)(periodo), 237 + count, { width: 30, align: 'center' });
                    count += vars_1.NOTA_CELDA_HEIGHT;
                }
            }
            count = 0;
        }
    }
}
exports.tablaNotasDatosInicial = tablaNotasDatosInicial;
