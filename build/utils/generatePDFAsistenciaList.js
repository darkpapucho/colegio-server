"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDFAsistenciaList = void 0;
const utils_1 = require("./generarBoletaNotas/utils/utils");
const vars_1 = require("./generarBoletaNotas/utils/vars");
const CELL_HEIGHT = 12;
const ASISTENCIA_CELL_WIDTH = CELL_HEIGHT;
const NOMBRE_CELL_WIDTH = 190;
const BEGIN_X = 20;
const BEGIN_Y = 120;
function generatePDFAsistenciaList({ pdfDocument, withData, asistenciaList, grado, seccion, nivel, year, periodo, calendarioDays, }) {
    pdfDocument.addPage();
    pdfDocument.fontSize(20).text(`Colegio ${vars_1.NOMBRE_COLEGIO}`);
    pdfDocument.fontSize(18).text(`Registro de asistencias - ${nivel} - ${year} - ${(0, utils_1.convertPeriodoKeyToName)(periodo).toUpperCase()}`);
    pdfDocument.text(`${grado} - ${seccion}`);
    const months = new Set();
    calendarioDays.forEach((record) => {
        if (!months.has(record.month)) {
            months.add(record.month);
        }
    });
    const monthsData = [];
    months.forEach((month) => {
        const days = [];
        calendarioDays.forEach((record) => {
            if (record.month === month) {
                days.push(record.day);
            }
        });
        const sortedDays = days.sort((prev, curr) => {
            return prev > curr ? 1 : -1;
        });
        monthsData.push({ month, days: sortedDays });
    });
    drawTableHeader(pdfDocument, monthsData);
    drawTableBody(pdfDocument, asistenciaList, monthsData, withData);
}
exports.generatePDFAsistenciaList = generatePDFAsistenciaList;
function drawTableHeader(pdfDocument, monthsData) {
    const TOTAL_DAYS = monthsData.reduce((acc, curr) => {
        return (acc += curr.days.length);
    }, 0);
    pdfDocument.fontSize(10);
    pdfDocument.rect(BEGIN_X, BEGIN_Y, NOMBRE_CELL_WIDTH, CELL_HEIGHT * 2).fillAndStroke('#27548A', '#000');
    pdfDocument.rect(BEGIN_X + NOMBRE_CELL_WIDTH, BEGIN_Y, ASISTENCIA_CELL_WIDTH * TOTAL_DAYS, CELL_HEIGHT).fillAndStroke('#27548A', '#000');
    pdfDocument.rect(BEGIN_X + NOMBRE_CELL_WIDTH, BEGIN_Y + CELL_HEIGHT, ASISTENCIA_CELL_WIDTH * TOTAL_DAYS, CELL_HEIGHT).fillAndStroke('#C14600', '#000');
    pdfDocument
        .moveTo(BEGIN_X + NOMBRE_CELL_WIDTH, BEGIN_Y)
        .lineTo(BEGIN_X + NOMBRE_CELL_WIDTH + ASISTENCIA_CELL_WIDTH * TOTAL_DAYS, BEGIN_Y)
        .stroke();
    pdfDocument
        .moveTo(BEGIN_X + NOMBRE_CELL_WIDTH, BEGIN_Y + CELL_HEIGHT * 2)
        .lineTo(BEGIN_X + NOMBRE_CELL_WIDTH + ASISTENCIA_CELL_WIDTH * TOTAL_DAYS, BEGIN_Y + CELL_HEIGHT * 2)
        .stroke();
    pdfDocument
        .font('Courier-Bold')
        .fillColor('white')
        .text('ALUMNO', BEGIN_X, BEGIN_Y + 7, { width: NOMBRE_CELL_WIDTH, align: 'center' });
    pdfDocument
        .moveTo(BEGIN_X + NOMBRE_CELL_WIDTH, BEGIN_Y + CELL_HEIGHT)
        .lineTo(BEGIN_X + NOMBRE_CELL_WIDTH + TOTAL_DAYS * ASISTENCIA_CELL_WIDTH, BEGIN_Y + CELL_HEIGHT)
        .stroke();
    let horizontalRef = BEGIN_X + NOMBRE_CELL_WIDTH;
    monthsData.forEach((record) => {
        pdfDocument.fontSize(9).text(record.month.toUpperCase(), horizontalRef, BEGIN_Y + 3, { width: ASISTENCIA_CELL_WIDTH * record.days.length, align: 'center' });
        let counter = horizontalRef + ASISTENCIA_CELL_WIDTH;
        record.days.forEach((day) => {
            pdfDocument
                .moveTo(counter, BEGIN_Y + CELL_HEIGHT)
                .lineTo(counter, BEGIN_Y + CELL_HEIGHT * 2)
                .stroke();
            pdfDocument.fontSize(7).text('' + day, counter - ASISTENCIA_CELL_WIDTH, BEGIN_Y + CELL_HEIGHT + 3, { width: ASISTENCIA_CELL_WIDTH, align: 'center' });
            counter += ASISTENCIA_CELL_WIDTH;
        });
        horizontalRef += ASISTENCIA_CELL_WIDTH * record.days.length;
        pdfDocument
            .moveTo(horizontalRef, BEGIN_Y)
            .lineTo(horizontalRef, BEGIN_Y + CELL_HEIGHT * 2)
            .stroke();
    });
}
function drawTableBody(pdfDocument, asistenciaList, monthsData, withData) {
    // const TOTAL_DAYS: number = monthsData.reduce((acc, curr) => {
    //   return (acc += curr.days.length)
    // }, 0)
    const CELL_PADDING = 2;
    let counter = 0;
    asistenciaList.forEach((asistenciaRecord, index) => {
        pdfDocument.rect(BEGIN_X, BEGIN_Y + CELL_HEIGHT * 2 + counter, NOMBRE_CELL_WIDTH, CELL_HEIGHT).stroke('#000');
        pdfDocument
            .fillColor('#000')
            .fontSize(7)
            .text(`[${index < 10 ? '0' + index : index}]` + asistenciaRecord.nombreCompleto, BEGIN_X + CELL_PADDING, BEGIN_Y + CELL_HEIGHT * 2 + counter + 3, { width: NOMBRE_CELL_WIDTH - CELL_PADDING, align: 'left' });
        //vertical small lines
        // for (let i = 0; i < TOTAL_DAYS; i++) {
        //   pdfDocument
        //     .moveTo(BEGIN_X + NOMBRE_CELL_WIDTH + ASISTENCIA_CELL_WIDTH * (i + 1), BEGIN_Y + CELL_HEIGHT * 2 + counter)
        //     .lineTo(BEGIN_X + NOMBRE_CELL_WIDTH + ASISTENCIA_CELL_WIDTH * (i + 1), BEGIN_Y + CELL_HEIGHT * 3 + counter)
        //     .stroke()
        // }
        //horizontal lines
        // pdfDocument
        //   .moveTo(BEGIN_X + NOMBRE_CELL_WIDTH, BEGIN_Y + CELL_HEIGHT * 3 + counter)
        //   .lineTo(BEGIN_X + NOMBRE_CELL_WIDTH + ASISTENCIA_CELL_WIDTH * TOTAL_DAYS, BEGIN_Y + CELL_HEIGHT * 3 + counter)
        //   .stroke()
        //ASISTENCIA RECORDS
        //for each month in the monthData
        let PREVIOUS_MONTH_LENGTH = 0;
        monthsData.forEach((monthRecord) => {
            let INNER_COUNTER = 0;
            monthRecord.days.forEach((day) => {
                //get the asistencia value
                const asistenciaDay = asistenciaRecord.records.find((ele) => {
                    return ele.month === monthRecord.month && ele.day === day;
                });
                const justificado = asistenciaDay === null || asistenciaDay === void 0 ? void 0 : asistenciaDay.justificado;
                const asistenciaValue = asistenciaDay ? asistenciaDay.asistencia : 'X';
                const cellFillColor = withData ? getAsistenciaRecordCellColor(asistenciaValue, justificado) : '#FFF';
                //fill colors
                pdfDocument.rect(PREVIOUS_MONTH_LENGTH + BEGIN_X + NOMBRE_CELL_WIDTH + INNER_COUNTER, BEGIN_Y + CELL_HEIGHT * 2 + counter, ASISTENCIA_CELL_WIDTH, CELL_HEIGHT).fillAndStroke(cellFillColor, '#000');
                //asistencia value
                if (withData) {
                    pdfDocument
                        .fillColor('#000')
                        .fontSize(8)
                        .font('Courier-Bold')
                        .text(asistenciaValue + '', PREVIOUS_MONTH_LENGTH + BEGIN_X + NOMBRE_CELL_WIDTH + INNER_COUNTER, BEGIN_Y + CELL_HEIGHT * 2 + counter + 3, {
                        width: ASISTENCIA_CELL_WIDTH,
                        align: 'center',
                    });
                }
                INNER_COUNTER += ASISTENCIA_CELL_WIDTH;
            });
            PREVIOUS_MONTH_LENGTH += monthRecord.days.length * ASISTENCIA_CELL_WIDTH;
        });
        counter += CELL_HEIGHT;
    });
}
function getAsistenciaRecordCellColor(asistenciaValue, justificado) {
    switch (asistenciaValue) {
        case 'A':
            return '#2DAA9E';
        case 'F':
            if (justificado)
                return '#FF0075';
            return '#F95454';
        case 'T':
            return '#FF9B17';
        case 'X':
            return '#DBDBDB';
        default:
            return '#FFF';
    }
}
