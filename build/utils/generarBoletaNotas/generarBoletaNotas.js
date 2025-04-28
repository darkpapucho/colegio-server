"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentZipInMemory = exports.generatePDFBuffer = exports.fillDataInBoletaNotaPerStudent = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generator_1 = require("./utils/generator");
const archiver_1 = __importDefault(require("archiver"));
const stream_1 = require("stream");
function generarBoletasDeNotasPdf({ registros, res, year, nivel }) {
    const libretas = new pdfkit_1.default({
        layout: 'portrait',
        size: 'A4',
        font: 'Courier',
        margins: { top: 20, left: 20, right: 20, bottom: 20 },
        autoFirstPage: false,
    });
    // libretas.pipe(fs.createWriteStream('./files/libreta.pdf'))
    libretas.pipe(res);
    if (registros.length === 0) {
        libretas.addPage();
        libretas.text('NO HAY ALUMNOS EN ESTE AÑO/SALÓN', 0, 100, {
            width: 600,
            align: 'center',
        });
        libretas.end();
        return;
    }
    registros.forEach((registro) => {
        //document.addPage()
        fillDataInBoletaNotaPerStudent({ document: libretas, registro, year, nivel });
    });
    libretas.end();
}
exports.default = generarBoletasDeNotasPdf;
function fillDataInBoletaNotaPerStudent({ document, registro, year, nivel }) {
    document.addPage();
    document.fontSize(14).text(`INFORME DE PROGRESO DEL APRENDIZAJE DEL ESTUDIANTE ${year}`, 0, 30, { width: 600, align: 'center', stroke: true });
    document.image('./assets/logo2.png', 435, 73, { width: 80 });
    if (nivel === 'primaria') {
        (0, generator_1.generarBoletasNotasPrimaria)({ document, registro, nivel });
    }
    else if (nivel === 'inicial') {
        (0, generator_1.generarBoletasNotasInicial)({ document, registro, nivel });
    }
}
exports.fillDataInBoletaNotaPerStudent = fillDataInBoletaNotaPerStudent;
function generatePDFBuffer({ nivel, year, registro }) {
    return new Promise((resolve, reject) => {
        const pdfBuffer = [];
        const pdfDocument = new pdfkit_1.default({ layout: 'portrait', size: 'A4', font: 'Courier', margins: { top: 20, left: 20, right: 20, bottom: 20 }, autoFirstPage: false });
        pdfDocument.on('data', (data) => pdfBuffer.push(data));
        pdfDocument.on('end', () => resolve(Buffer.concat(pdfBuffer)));
        pdfDocument.on('error', (err) => reject(err));
        fillDataInBoletaNotaPerStudent({ nivel, year, registro, document: pdfDocument });
        pdfDocument.end();
    });
}
exports.generatePDFBuffer = generatePDFBuffer;
function createStudentZipInMemory({ registros, nivel, year, grado, seccion, res }) {
    return __awaiter(this, void 0, void 0, function* () {
        const zipFile = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        const tempStream = new stream_1.PassThrough();
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=Notas-${grado}-${seccion}`);
        zipFile.pipe(tempStream);
        tempStream.pipe(res);
        for (const registro of registros) {
            const pdfBuffer = yield generatePDFBuffer({ nivel, year, registro });
            zipFile.append(pdfBuffer, { name: `${registro.estudiante[0].nombreCompleto}.pdf` });
        }
        yield zipFile.finalize();
    });
}
exports.createStudentZipInMemory = createStudentZipInMemory;
