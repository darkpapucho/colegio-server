"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePensionTablePdf = void 0;
const periodosDates_1 = require("../vars/periodosDates");
const drawCellTable_1 = require("./drawCellTable");
const vars_1 = require("./generarBoletaNotas/utils/vars");
// import { PensionRecord } from '../types/pensiones'
const HEADER_CELL_HEIGHT = 34;
const BODY_CELL_HEIGHT = 20;
const TABLE_BEGIN = { x: 20, y: 70 };
const BEGIN = { x: 20, y: 20 };
const CELL_HEIGHT = 20;
const CELL_WIDTH = 100;
const CELL_WIDTH_DATA = 180;
const pensionesTableHeaders = {
    primerSemestre: [
        {
            label: 'ALUMNO',
            width: 200,
            fontSize: 16,
            textVerticalOffSet: HEADER_CELL_HEIGHT / 2 - 6,
        },
        {
            label: 'Marzo',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Abril',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Mayo',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Junio',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Julio',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
    ],
    segundoSemestre: [
        {
            label: 'Alumno',
            width: 200,
            fontSize: 16,
            textVerticalOffSet: HEADER_CELL_HEIGHT / 2 - 6,
        },
        {
            label: 'Agosto',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Septiembre',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Octubre',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Noviembre',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
        {
            label: 'Diciembre',
            width: 110,
            fontSize: 10,
            textVerticalOffSet: 4,
        },
    ],
};
function generatePensionTablePdf(pdf, list, { nivel, grado, seccion, semestre }) {
    drawSchoolData(pdf, { nivel, grado, seccion });
    drawTableHeaders(pdf, semestre);
    //body:
    drawTableBodyData(pdf, { list, semestre });
}
exports.generatePensionTablePdf = generatePensionTablePdf;
function drawSchoolData(document, { nivel, grado, seccion }) {
    (0, drawCellTable_1.drawCell)(document, { begin: { x: BEGIN.x, y: BEGIN.y }, height: 20, width: CELL_WIDTH, content: `  COLEGIO`, options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' } });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: BEGIN.x, y: BEGIN.y + CELL_HEIGHT },
        height: 20,
        width: CELL_WIDTH,
        content: `  NIVEL`,
        options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: BEGIN.x + CELL_WIDTH, y: BEGIN.y },
        height: 20,
        width: CELL_WIDTH_DATA,
        content: `  ${vars_1.NOMBRE_COLEGIO.toUpperCase()}`,
        options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: BEGIN.x + CELL_WIDTH, y: BEGIN.y + CELL_HEIGHT },
        height: 20,
        width: CELL_WIDTH_DATA,
        content: `  ${nivel.toUpperCase()}`,
        options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
    });
    //###########################
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA, y: BEGIN.y },
        height: 20,
        width: CELL_WIDTH_DATA,
        content: `  GRADO`,
        options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA, y: BEGIN.y + CELL_HEIGHT },
        height: 20,
        width: CELL_WIDTH,
        content: `  SECCIÓN`,
        options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA + CELL_WIDTH, y: BEGIN.y },
        height: 20,
        width: CELL_WIDTH,
        content: `  ${grado}`,
        options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA + CELL_WIDTH, y: BEGIN.y + CELL_HEIGHT },
        height: 20,
        width: CELL_WIDTH,
        content: `  ${seccion}`,
        options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
    });
}
function drawTableHeaders(pdf, semestre) {
    let WIDTH_ACC = 0;
    //headers;
    pensionesTableHeaders[semestre == 1 ? 'primerSemestre' : 'segundoSemestre'].forEach((record, index) => {
        (0, drawCellTable_1.drawCell)(pdf, {
            begin: { x: TABLE_BEGIN.x + WIDTH_ACC, y: TABLE_BEGIN.y },
            width: record.width,
            content: record.label,
            height: HEADER_CELL_HEIGHT,
            options: { align: 'center', fillColor: '#DADADA', textVerticalOffSet: record.textVerticalOffSet, fontSize: record.fontSize },
        });
        if (index > 0) {
            (0, drawCellTable_1.drawCell)(pdf, {
                begin: { x: TABLE_BEGIN.x + WIDTH_ACC, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT / 2 },
                width: record.width / 2,
                content: 'MONTO',
                height: HEADER_CELL_HEIGHT / 2,
                options: { align: 'center', fillColor: '#DADADA', textVerticalOffSet: record.textVerticalOffSet, fontSize: record.fontSize },
            });
            (0, drawCellTable_1.drawCell)(pdf, {
                begin: { x: TABLE_BEGIN.x + record.width / 2 + WIDTH_ACC, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT / 2 },
                width: record.width / 2,
                content: 'FECHA',
                height: HEADER_CELL_HEIGHT / 2,
                options: { align: 'center', fillColor: '#DADADA', textVerticalOffSet: record.textVerticalOffSet, fontSize: record.fontSize },
            });
        }
        WIDTH_ACC += record.width;
    });
}
function drawTableBodyData(pdf, { list, semestre }) {
    list.forEach((pensionListRow, index) => {
        let widthCounter = 0;
        pensionesTableHeaders[semestre == 1 ? 'primerSemestre' : 'segundoSemestre'].forEach((header, i) => {
            if (i === 0) {
                (0, drawCellTable_1.drawCell)(pdf, {
                    begin: { x: TABLE_BEGIN.x + widthCounter, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
                    width: header.width,
                    content: `  [${index + 1}] ${pensionListRow.nombreCompleto.substring(0, pensionListRow.nombreCompleto.lastIndexOf(' '))}`,
                    height: BODY_CELL_HEIGHT,
                    options: { align: 'left', fillColor: '#EAEAEA', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 8 },
                });
            }
            else {
                const month = header.label.toLowerCase();
                const numberMonth = (0, periodosDates_1.parseMonthNameToMonthNumber1to12)(month) - 1;
                const pensionRecordFound = pensionListRow.pensiones.find((pension) => pension.mes === numberMonth);
                let monto = '';
                let fecha = '';
                let pagadoCompletamente = false;
                let montoPagado = 0;
                if (pensionRecordFound) {
                    montoPagado = pensionRecordFound.monto_pagado;
                    monto = montoPagado > 0 ? `${montoPagado}/${pensionRecordFound.monto_pagar}` : '';
                    fecha = pensionRecordFound.fecha ? new Date(pensionRecordFound.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
                    pagadoCompletamente = pensionRecordFound.pagado;
                }
                else if (!pensionRecordFound) {
                    monto = 'XXXXX';
                    fecha = 'XXXXX';
                }
                (0, drawCellTable_1.drawCell)(pdf, {
                    begin: { x: TABLE_BEGIN.x + widthCounter, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
                    width: header.width / 2,
                    content: monto,
                    height: BODY_CELL_HEIGHT,
                    options: { align: 'center', fillColor: !pagadoCompletamente && montoPagado > 0 ? '#ff7a83' : '#FFF', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 9 },
                });
                (0, drawCellTable_1.drawCell)(pdf, {
                    begin: { x: TABLE_BEGIN.x + widthCounter + header.width / 2, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
                    width: header.width / 2,
                    content: fecha,
                    height: BODY_CELL_HEIGHT,
                    options: { align: 'center', fillColor: !pagadoCompletamente && montoPagado > 0 ? '#ff7a83' : '#FFF', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 9 },
                });
            }
            widthCounter += header.width;
        });
    });
}
