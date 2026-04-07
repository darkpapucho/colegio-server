import { ReciboData } from "../types/recibo";

const RIGHT_VERTICAL_START = 50;

const MARGIN_ID = 30;
const MARGIN_DESCRIPCION = 85;
const MARGIN_CANTIDAD = 240;
const MARGIN_PRECIO = 330;
const MARGIN_DCTO = 400;
const MARGIN_TOTAL = 480;
const VERTICAL_START = 385;
export default function generateReciboPension( data:ReciboData, pdf: PDFKit.PDFDocument, costo: number) {
    const { numRecibo, nivel, fecha, operacion, detalles, alumno } = data;
    const mora = detalles.mora ?? 0;
    pdf.addPage()
    pdf.image("assets/logo2.png", 30, 40, { width: 40 })
    pdf.font("Helvetica-Bold").fontSize(20).text("IEP Jesús el Nazareno", 80, 40,{align:"left", underline: true});
    pdf.font("Times-Roman").fontSize(15).text("IEP Jesús el Nazareno", 30, 120,{align:"left"});
    pdf.font("Times-Roman").fontSize(14).text("Calle Coronel Portillo Lote 3 Mz 43",{align:"left"});
    pdf.font("Times-Roman").fontSize(14).text("Telf: 925355517",{align:"left"});
    pdf.font("Times-Roman").fontSize(14).text("www.iepjesuselnazareno.edu.pe",{align:"left"});
    pdf.text(`Recibo N°: ${(numRecibo+"").padStart(5, "0")}`, 400, RIGHT_VERTICAL_START, { align: "right" })
    pdf.text("Fecha: "+new Date(fecha).toLocaleDateString("es-PE",{day:"2-digit", month:"2-digit", year:"numeric"}), 400, RIGHT_VERTICAL_START + 130, { align: "right" })
    pdf.image("assets/qr.png", 510, RIGHT_VERTICAL_START + 145  , { width: 66 })

    pdf.font("Helvetica-Bold").fontSize(12)
    pdf.text(alumno.nombreCompleto, MARGIN_ID, VERTICAL_START - 75);
    pdf.text(`${alumno.grado} ${alumno.seccion}`, MARGIN_ID, VERTICAL_START - 55);
    pdf.text(nivel.toUpperCase(), MARGIN_ID, VERTICAL_START - 35);
    pdf.moveTo(30, VERTICAL_START-10).lineTo(570, VERTICAL_START-10).stroke();
    pdf.font("Times-Roman")
    pdf.text("ID", MARGIN_ID, VERTICAL_START)
    pdf.text("Descripción", MARGIN_DESCRIPCION, VERTICAL_START)
    pdf.text("Cantidad", MARGIN_CANTIDAD, VERTICAL_START)
    pdf.text("Precio S/.", MARGIN_PRECIO, VERTICAL_START)
    pdf.text("Dcto S/.", MARGIN_DCTO, VERTICAL_START)
    pdf.text("Pagado S/.", MARGIN_TOTAL, VERTICAL_START)

    pdf.moveTo(30, VERTICAL_START+15).lineTo(570, VERTICAL_START+15).stroke();

    pdf.text(operacion, MARGIN_ID, VERTICAL_START + 30)
    pdf.text(detalles.descripcion, MARGIN_DESCRIPCION, VERTICAL_START + 30)
    pdf.text("1", MARGIN_CANTIDAD, VERTICAL_START + 30)
    pdf.text(`${costo.toFixed(2)}`, MARGIN_PRECIO, VERTICAL_START + 30)
    pdf.text(`${(costo - detalles.montoPagado).toFixed(2)}`, MARGIN_DCTO, VERTICAL_START + 30)
    pdf.text(`${detalles.montoPagado.toFixed(2)}`, MARGIN_TOTAL, VERTICAL_START + 30, {align: "right", width: 80})   

    pdf.moveTo(30, VERTICAL_START+55).lineTo(570, VERTICAL_START+55).stroke();
    pdf.text("Mora por pago atrasado: S/.", MARGIN_CANTIDAD, VERTICAL_START + 60)
    pdf.text(`${mora.toFixed(2)}`, MARGIN_TOTAL, VERTICAL_START + 60,{align: "right", width: 80})
    pdf.moveTo(30, VERTICAL_START+73).lineTo(570, VERTICAL_START+73).stroke();
    pdf.font("Helvetica-Bold").text("Total a pagar S/.", MARGIN_CANTIDAD, VERTICAL_START + 85)
    pdf.text(`${(detalles.montoPagado + mora).toFixed(2)}`, MARGIN_TOTAL, VERTICAL_START + 85, {align: "right", width: 80})
}
  