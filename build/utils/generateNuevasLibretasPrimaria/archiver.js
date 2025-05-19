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
exports.libretasPrimariaBuffer = exports.zipLibretasPrimaria = void 0;
const archiver_1 = __importDefault(require("archiver"));
const generateLibretasPrimaria_1 = __importDefault(require("./generateLibretasPrimaria"));
const pdfkit_1 = __importDefault(require("pdfkit"));
function zipLibretasPrimaria({ res, tutor, nivel, grado, seccion, year, registro, cursosSalon, periodo, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const zipFile = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=Notas-${grado}-${seccion}`);
        zipFile.pipe(res);
        for (const notas of registro) {
            const buffer = yield libretasPrimariaBuffer({
                tutor,
                nivel,
                grado,
                seccion,
                year,
                notas,
                cursosSalon,
                periodo,
            });
            zipFile.append(buffer, { name: `${notas.alumno}.pdf` });
        }
        yield zipFile.finalize();
    });
}
exports.zipLibretasPrimaria = zipLibretasPrimaria;
function libretasPrimariaBuffer({ tutor, nivel, grado, seccion, year, notas, cursosSalon, periodo, }) {
    return new Promise((resolve, reject) => {
        const pdfBuffer = [];
        const doc = new pdfkit_1.default({ layout: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 }, autoFirstPage: false, size: 'A4' });
        doc.on('data', (chunk) => pdfBuffer.push(chunk));
        doc.on('error', (err) => reject(err));
        doc.on('end', () => resolve(Buffer.concat(pdfBuffer)));
        (0, generateLibretasPrimaria_1.default)({
            doc,
            tutor,
            nivel,
            grado,
            seccion,
            year,
            notas,
            cursosSalon,
            periodo,
        });
        doc.end();
    });
}
exports.libretasPrimariaBuffer = libretasPrimariaBuffer;
