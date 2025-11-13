"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInformeRendimientoAcademicoPDF = void 0;
const drawCellTable_1 = require("./drawCellTable");
const showOnly2Names_1 = require("./showOnly2Names");
function generateInformeRendimientoAcademicoPDF(document, grado, seccion, resultados) {
    document.addPage();
    document.font('Courier-Bold').fontSize(18).text('IEP JESÚS EL NAZARENO', { align: 'center', underline: true });
    document.fontSize(16).text(`LISTA DE MÉRITO`, { align: 'center', underline: true });
    document.fontSize(14).text(`${grado} ${seccion}`, { align: 'center', underline: true });
    document.image('assets/logo-transparente1.png', 490, 30, { width: 56, height: 65 });
    document.fontSize(12).font('Courier').text('\n\nLa presente lista presenta los promedios de notas obtenido por los alumnos a lo largo de todos los periodos transcurridos.');
    let begin = { x: 30, y: 170 };
    const cellHeight = 21;
    const ordenMeritoCellWidth = 25;
    const nombreCellWidth = 360;
    const notaCellWidth = 50;
    const textVerticalOffSet = 4;
    //encabezados
    document.fontSize(14).font('Courier-Bold');
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x, y: begin.y - 20 },
        height: cellHeight,
        width: ordenMeritoCellWidth,
        content: 'N°',
        options: { align: 'center', textVerticalOffSet, fillColor: '#d9d9d9' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x + ordenMeritoCellWidth, y: begin.y - 20 },
        height: cellHeight,
        width: nombreCellWidth,
        content: 'ALUMNO',
        options: { align: 'center', textVerticalOffSet, fillColor: '#d9d9d9' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x + ordenMeritoCellWidth + nombreCellWidth, y: begin.y - 20 },
        height: cellHeight,
        width: notaCellWidth,
        content: 'AC',
        options: { align: 'center', textVerticalOffSet, fillColor: '#d9d9d9' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x + ordenMeritoCellWidth + notaCellWidth + nombreCellWidth, y: begin.y - 20 },
        height: cellHeight,
        width: notaCellWidth,
        content: 'CX',
        options: { align: 'center', textVerticalOffSet, fillColor: '#d9d9d9' },
    });
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x + ordenMeritoCellWidth + notaCellWidth * 2 + nombreCellWidth, y: begin.y - 20 },
        height: cellHeight,
        width: notaCellWidth,
        content: 'PO',
        options: { align: 'center', textVerticalOffSet, fillColor: '#d9d9d9' },
    });
    // body
    document.font('Courier').fontSize(12);
    resultados.forEach((row, index) => {
        const fillColor = index == 0 ? '#34eb34' : index == 1 ? '#f5ee1b' : index == 2 ? '#f5b01b' : '#fff';
        (0, drawCellTable_1.drawCell)(document, {
            begin: { x: begin.x, y: begin.y + cellHeight * index },
            height: cellHeight,
            width: ordenMeritoCellWidth,
            content: index + 1 + '',
            options: { textVerticalOffSet: textVerticalOffSet + 1, paddingX: 8, fontSize: 14, align: 'right', fillColor },
        });
        (0, drawCellTable_1.drawCell)(document, {
            begin: { x: begin.x + ordenMeritoCellWidth, y: begin.y + cellHeight * index },
            height: cellHeight,
            width: nombreCellWidth,
            content: (0, showOnly2Names_1.showOnly2Names)(row.alumno),
            options: { textVerticalOffSet: textVerticalOffSet + 2, paddingX: 12, fontSize: 12, align: 'left', fillColor },
        });
        (0, drawCellTable_1.drawCell)(document, {
            begin: { x: begin.x + ordenMeritoCellWidth + nombreCellWidth, y: begin.y + cellHeight * index },
            height: cellHeight,
            width: notaCellWidth,
            content: row.academico,
            options: { textVerticalOffSet: textVerticalOffSet + 2, fontSize: 12, align: 'center', fillColor },
        });
        (0, drawCellTable_1.drawCell)(document, {
            begin: { x: begin.x + ordenMeritoCellWidth + notaCellWidth + nombreCellWidth, y: begin.y + cellHeight * index },
            height: cellHeight,
            width: notaCellWidth,
            content: row.conducta,
            options: { textVerticalOffSet: textVerticalOffSet + 2, fontSize: 12, align: 'center', fillColor },
        });
        (0, drawCellTable_1.drawCell)(document, {
            begin: { x: begin.x + ordenMeritoCellWidth + notaCellWidth * 2 + nombreCellWidth, y: begin.y + cellHeight * index },
            height: cellHeight,
            width: notaCellWidth,
            content: row.ponderado,
            options: { textVerticalOffSet: textVerticalOffSet + 2, fontSize: 12, align: 'center', fillColor },
        });
    });
    //leyenda:
    document.font('Courier-Bold').fontSize(10);
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x, y: begin.y + (resultados.length + 1.5) * cellHeight },
        height: cellHeight,
        width: notaCellWidth,
        content: 'AC',
        options: { textVerticalOffSet: textVerticalOffSet + 2, align: 'center', fillColor: '#d9d9d9' },
    });
    document.font('Courier');
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x + notaCellWidth, y: begin.y + (resultados.length + 1.5) * cellHeight },
        height: cellHeight,
        width: notaCellWidth * 4,
        content: 'Promedio académico',
        options: { textVerticalOffSet: textVerticalOffSet + 2, paddingX: 8 },
    });
    document.font('Courier-Bold');
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x, y: begin.y + (resultados.length + 2.5) * cellHeight },
        height: cellHeight,
        width: notaCellWidth,
        content: 'CX',
        options: { textVerticalOffSet: textVerticalOffSet + 2, align: 'center', fillColor: '#d9d9d9' },
    });
    document.font('Courier');
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x + notaCellWidth, y: begin.y + (resultados.length + 2.5) * cellHeight },
        height: cellHeight,
        width: notaCellWidth * 4,
        content: 'Promedio conducta',
        options: { textVerticalOffSet: textVerticalOffSet + 2, paddingX: 8 },
    });
    document.font('Courier-Bold');
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x, y: begin.y + (resultados.length + 3.5) * cellHeight },
        height: cellHeight,
        width: notaCellWidth,
        content: 'PO',
        options: { textVerticalOffSet: textVerticalOffSet + 2, align: 'center', fillColor: '#d9d9d9' },
    });
    document.font('Courier');
    (0, drawCellTable_1.drawCell)(document, {
        begin: { x: begin.x + notaCellWidth, y: begin.y + (resultados.length + 3.5) * cellHeight },
        height: cellHeight,
        width: notaCellWidth * 4,
        content: 'Promedio ponderado',
        options: { textVerticalOffSet: textVerticalOffSet + 2, paddingX: 8 },
    });
    //fecha
    document
        .fontSize(14)
        .font('Courier-BoldOblique')
        .text(new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }), 20, begin.y + cellHeight * (resultados.length + 4), { align: 'right' });
}
exports.generateInformeRendimientoAcademicoPDF = generateInformeRendimientoAcademicoPDF;
