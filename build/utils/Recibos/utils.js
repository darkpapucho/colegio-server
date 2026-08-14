"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reciboFooter = exports.reciboTotalPagar = exports.reciboMora = exports.reciboBody = exports.reciboHeader = void 0;
const RIGHT_VERTICAL_START = 50;
const MARGIN_ID = 30;
const MARGIN_DESCRIPCION = 85;
const MARGIN_CANTIDAD = 240;
const MARGIN_PRECIO = 330;
const MARGIN_DCTO = 400;
const MARGIN_TOTAL = 480;
const VERTICAL_START = 455;
function reciboHeader(data, pdf) {
    const { numRecibo, fecha } = data;
    pdf.addPage();
    pdf.image('assets/logo2.png', 30, 40, { width: 40 });
    pdf.font('Helvetica-Bold').fontSize(20).text('IEP Jesús el Nazareno', 80, 60, { align: 'left', underline: true });
    pdf.font('Helvetica').fontSize(15).text('IEP Jesús el Nazareno', 30, 135, { align: 'left' });
    pdf.font('Helvetica').fontSize(12).text('Calle Coronel Portillo Lote 3 Mz 43', 30, 162, { align: 'left' });
    pdf.font('Helvetica').fontSize(12).text('Telf: 925355517', 30, 177, { align: 'left' });
    pdf.font('Helvetica').fontSize(12).text('https://colegiojesusnazareno.netlify.app', 30, 192, { align: 'left' });
    pdf.text(`Recibo N°: ${(numRecibo + '').padStart(5, '0')}`, 400, RIGHT_VERTICAL_START, { align: 'right' });
    pdf.image('assets/qr.png', 465, RIGHT_VERTICAL_START + 165, { width: 115 });
    pdf.font('Helvetica-Bold').fontSize(12);
    pdf.text('Fecha: ' + new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }), 400, RIGHT_VERTICAL_START + 150, { align: 'right' });
}
exports.reciboHeader = reciboHeader;
function reciboBody(data, pdf, costo) {
    const { nivel, operacion, detalles, alumno } = data;
    const descuento = costo - detalles.montoPagado;
    pdf.text('DATOS DEL ALUMNO', MARGIN_ID, VERTICAL_START - 100);
    pdf
        .moveTo(MARGIN_ID, VERTICAL_START - 85)
        .lineTo(570, VERTICAL_START - 85)
        .stroke();
    pdf.text(alumno.nombreCompleto, MARGIN_ID, VERTICAL_START - 75);
    pdf.text(`${alumno.grado} ${alumno.seccion}`, MARGIN_ID, VERTICAL_START - 55);
    pdf.text(nivel.toUpperCase(), MARGIN_ID, VERTICAL_START - 35);
    pdf
        .moveTo(30, VERTICAL_START - 10)
        .lineTo(570, VERTICAL_START - 10)
        .stroke();
    pdf.font('Times-Roman');
    pdf.text('ID', MARGIN_ID, VERTICAL_START);
    pdf.text('Descripción', MARGIN_DESCRIPCION, VERTICAL_START);
    pdf.text('Cantidad', MARGIN_CANTIDAD, VERTICAL_START);
    pdf.text('Precio S/.', MARGIN_PRECIO, VERTICAL_START);
    pdf.text('Dcto S/.', MARGIN_DCTO, VERTICAL_START);
    pdf.text('Monto Final S/.', MARGIN_TOTAL, VERTICAL_START);
    pdf
        .moveTo(30, VERTICAL_START + 15)
        .lineTo(570, VERTICAL_START + 15)
        .stroke();
    pdf.text(operacion, MARGIN_ID, VERTICAL_START + 30);
    pdf.text(detalles.descripcion, MARGIN_DESCRIPCION, VERTICAL_START + 30);
    pdf.text('1', MARGIN_CANTIDAD, VERTICAL_START + 30);
    pdf.text(`${costo.toFixed(2)}`, MARGIN_PRECIO, VERTICAL_START + 30);
    pdf.text(`${(descuento >= 0 ? descuento : 0).toFixed(2)}`, MARGIN_DCTO, VERTICAL_START + 30);
    pdf.text(`${detalles.montoPagado.toFixed(2)}`, MARGIN_TOTAL, VERTICAL_START + 30, { align: 'right', width: 80 });
}
exports.reciboBody = reciboBody;
function reciboMora(data, pdf) {
    var _a;
    const mora = (_a = data.detalles.mora) !== null && _a !== void 0 ? _a : 0;
    pdf
        .moveTo(30, VERTICAL_START + 55)
        .lineTo(570, VERTICAL_START + 55)
        .stroke();
    pdf.text('Mora por pago atrasado: S/.', MARGIN_CANTIDAD, VERTICAL_START + 60);
    pdf.text(`${mora.toFixed(2)}`, MARGIN_TOTAL, VERTICAL_START + 60, { align: 'right', width: 80 });
    pdf
        .moveTo(30, VERTICAL_START + 73)
        .lineTo(570, VERTICAL_START + 73)
        .stroke();
}
exports.reciboMora = reciboMora;
function reciboTotalPagar(data, pdf) {
    pdf.font('Helvetica-Bold').text('Monto Pagado S/.', MARGIN_DCTO, VERTICAL_START + 85);
    pdf.text(`${data.detalles.montoPagado.toFixed(2)}`, MARGIN_TOTAL, VERTICAL_START + 85, { align: 'right', width: 80 });
    pdf.image('assets/cancelado.png', 396, 580, { width: 180 });
}
exports.reciboTotalPagar = reciboTotalPagar;
function reciboFooter(pdf) {
    pdf.moveTo(MARGIN_ID, 660).lineTo(570, 660).dash(4, { space: 4 }).stroke();
    pdf.text('Observaciones', MARGIN_ID, 680);
    pdf.fontSize(10).font('Helvetica-Oblique');
    pdf.text('1) Se considera pago a tiempo hasta el décimo día del siguiente mes.', MARGIN_ID, 700);
    pdf.text('2) Se considera pago adelantado hasta el día 25 del mes anterior.', MARGIN_ID, 715);
    pdf.text('3) Se considera pago atrasado a partir del 11 del mes siguiente.', MARGIN_ID, 730);
    pdf.text('4) El descuento por pago de pensión adelantado es de S/. 10.00.', MARGIN_ID, 745);
    pdf.text('5) La mora por pago de pensión atrasado es de S/. 1.00 por día de retraso.', MARGIN_ID, 760);
}
exports.reciboFooter = reciboFooter;
