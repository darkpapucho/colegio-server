"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateCertificadoConducta = exports.GenerateCertificadoNoAdeudo = exports.GenerateResolucionTraslado = void 0;
function parseGradDestino(gradDest, nivel) {
    if (gradDest === 'PRIMERO PRIMARIA') {
        return { gradoDestino: 'PRIMERO', nivelDestino: 'PRIMARIA' };
    }
    else if (gradDest === 'PRIMERO SECUNDARIA') {
        return { gradoDestino: 'PRIMERO', nivelDestino: 'SECUNDARIA' };
    }
    else {
        return { gradoDestino: gradDest, nivelDestino: nivel };
    }
}
const font = 'Courier';
const fontBold = 'Courier-Bold';
function GenerateResolucionTraslado({ numeroResolucion, document, alumno, data, nivel, }) {
    const { codigoModular: coldigoModularDestino, colegioDestino, gradoDestino: gradoDest, fechaEmision } = data;
    const codigoModular = nivel === 'inicial' ? 1442391 : 1544220;
    const { nivelDestino, gradoDestino } = parseGradDestino(gradoDest, nivel);
    document.addPage();
    document.font(font);
    document.lineGap(3);
    document.fillColor('#11009E').text('Año de la esperanza y el fortalecimiento de la democracia'.toUpperCase(), {
        align: 'center',
    });
    document.image('./assets/logo-transparente2.png', 75, 200, { width: 450 });
    document.text('\n').fillColor('#4942E4');
    document.text('IEP Jesús el Nazareno de Villas de Ancón', { align: 'center' });
    document.text(nivel.toUpperCase(), { align: 'center' });
    document.text(`Cod. Modular: ${codigoModular}`, { align: 'center' });
    document.text(`RD N° - ${numeroResolucion} - ${new Date(fechaEmision).getFullYear()}\n`, { align: 'center' });
    document.fontSize(10).fillColor('black');
    document.text(`\n\n\n\nVisto, la constacia de vacante presentada por el padre del estudiante ${alumno.nombreCompleto.toUpperCase()} del ${alumno.grado} ${alumno.seccion.toUpperCase()} de educación ${nivel.toUpperCase()}, otorgada por la I.E. ${colegioDestino ? colegioDestino.toUpperCase() : '__________________________________________________________'}. `, {
        align: 'justify',
    });
    document.text(`\nCONSIDERANDO:`);
    document.text(`\nQue, es procedente autorizar el traslado de matrícula y garantizar la continuidad de estudios del educando en el nivel ${nivelDestino.toUpperCase()}.`, {
        indent: 26,
        align: 'justify',
    });
    document.text(`\nDe conformidad con lo dispuesto por la ley 28044, la directiva N°-004-VMGP-2005, aprobado por R.M. N° 0234-2005-ED, D.S. N°-0572-15-ED.`, { align: 'justify' });
    document.font('Courier-Bold').text(`\nSE RESUELVE:`);
    document.font(font).text(`\nArtículo 1°: Autorizar el traslado de matrícula de:`);
    document.text('\n');
    document
        .text('APELLIDOS Y NOMBRES:  ', { indent: 26, continued: true })
        .font('Courier-Bold')
        .text(`${alumno.nombreCompleto.toUpperCase()}`)
        .font(font)
        .text('DNI/CÓDIGO DE ESTUDIANTE:  ', { indent: 26, continued: true })
        .font('Courier-Bold')
        .text(`${alumno.dni ? alumno.dni : alumno.codigoEstudiante}`)
        .font(font)
        .text('I.E. DESTINO:  ', { indent: 26, continued: true })
        .font('Courier-Bold')
        .text(`${colegioDestino ? colegioDestino.toUpperCase() : '____________________________________________________'}${coldigoModularDestino && ' - ' + coldigoModularDestino}`);
    document.font(font).text(`\nAPTO PARA CONTINUAR SUS ESTUDIOS EN ${gradoDestino.toUpperCase()} DEL NIVEL ${nivelDestino.toUpperCase()}. `, { indent: 26 });
    document.text(`\nArtículo 2°: Disponer, que la secretaría entregue con cargo todos los documentos de escolaridad que comprende el estudiante.`, { align: 'justify' });
    document.text(`\n\nVillas de Ancón, ${new Date(fechaEmision).toLocaleDateString('ES-es', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'right', oblique: true });
    document.text('\n\n\n\n\nVILMA PAJUELO ESPINOZA', { align: 'center', underline: true });
    document.lineGap(1);
    document.text('DIRECTORA', { align: 'center' });
    document.image('./assets/firma.png', 250, 640, { width: 120 });
    document.image('./assets/SELLO.png', 200, 630, { width: 100 });
}
exports.GenerateResolucionTraslado = GenerateResolucionTraslado;
function GenerateCertificadoNoAdeudo({ document, alumno, fechaEmision, nivel }) {
    document.addPage();
    document.lineGap(3);
    document.image('./assets/escudo-peruano-transparente.png', 70, 70, { width: 60 });
    document.image('./assets/logo-transparente1.png', 480, 70, { width: 60 });
    document.fontSize(15).text('I.E.P. JESÚS EL NAZARENO', { align: 'center' });
    document.text('VILLAS DE ANCÓN', { align: 'center' });
    document.text(nivel.toUpperCase(), { align: 'center' });
    document.font('Courier-Bold').text('\n\nCONSTANCIA DE NO ADEUDO', { align: 'center' });
    document.font(font).fontSize(10);
    document.text('\n\n\nLa directora de la I.E.P. "Jesús el Nazareno de Villas de Ancón", que suscribe: ', { align: 'justify' });
    document.font('Courier-Bold').text('\n\nHACE CONSTAR QUE:', { indent: 26 });
    document
        .font(font)
        .text('\nEL ALUMNO(A) ', { continued: true })
        .font(fontBold)
        .text(`${alumno.nombreCompleto.toUpperCase()} `, { continued: true })
        .font(font)
        .text('CON CÓDIGO DE ESTUDIANTE/DNI ', { continued: true })
        .font(fontBold)
        .text(`${alumno.dni} `, { continued: true })
        .font(font)
        .text(' SE ENCUENTRA AL DÍA EN EL PAGO DE TODAS LAS MENSUALIDADES Y QUE NO ADEUDA NINGÚN PAGO');
    document.text('\nSE EXPIDE EL PRESENTE DOCUMENTO A SOLICITUD DEL PADRE DE FAMILIA PARA LOS FINES QUE ESTIME CONVENIENTE', { align: 'justify' });
    document.text(`\n\n\n\nVillas de Ancón, ${new Date(fechaEmision).toLocaleDateString('ES-es', { day: '2-digit', month: 'long', year: 'numeric' })}`, {
        align: 'right',
        oblique: true,
    });
    document.text(`\n\n\n\n\n\n\n\nVILMA PAJUELO ESPINOZA`, { underline: true, align: 'center' });
    document.text(`DIRECTORA`, { align: 'center' });
    document.image('./assets/firma.png', 250, 530, { width: 120 });
    document.image('./assets/SELLO.png', 200, 510, { width: 100 });
}
exports.GenerateCertificadoNoAdeudo = GenerateCertificadoNoAdeudo;
function GenerateCertificadoConducta({ document, nivel, alumno, añoEstudio, fechaEmision, }) {
    document.addPage();
    document.lineGap(3);
    document.image('./assets/escudo-peruano-transparente.png', 70, 70, { width: 60 });
    document.image('./assets/logo-transparente1.png', 480, 70, { width: 60 });
    document.fontSize(15).text('I.E.P JESÚS EL NAZARENO', { align: 'center' });
    document.text('VILLAS DE ANCÓN', { align: 'center' });
    document.text(nivel.toUpperCase(), { align: 'center' });
    document.font('Courier-Bold').text('\nCERTIFICADO DE BUENA CONDUCTA', { align: 'center' });
    document.font(font).text('\n\n\n');
    document.fontSize(10);
    document.text('\nLa directora de la I.E.P. "Jesús el Nazareno de Villas de Ancón", que suscribe:', { align: 'justify' });
    document.font('Courier-Bold').text('\n\nHACE CONSTAR QUE:', { indent: 26 });
    document
        .font(font)
        .text('\nEL ALUMNO(A) ', { continued: true })
        .font(fontBold)
        .text(`${alumno.nombreCompleto.toUpperCase()} `, { continued: true })
        .font(font)
        .text('CON CÓDIGO DE ESTUDIANTE/DNI ', { continued: true })
        .font(fontBold)
        .text(`${alumno.dni} `, { continued: true })
        .font(font)
        .text(` DEMOSTRÓ BUENA CONDUCTA DURANTE EL AÑO ACADÉMICO ${añoEstudio} CON CALIFICACIÓN A.`, {
        align: 'justify',
        indent: 26,
    });
    document.text('\nSE EXPIDE EL PRESENTE DOCUMENTO A SOLICITUD DEL PADRE DE FAMILIA PARA LOS FINES QUE ESTIME CONVENIENTE.', { align: 'justify' });
    document.text(`\n\n\n\nVillas de Ancón, ${new Date(fechaEmision).toLocaleDateString('ES-es', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'right' });
    document.text('\n\n\n\n\n\n\n\n\nVILMA PAJUELO ESPINOZA', { underline: true, align: 'center' });
    document.text(`DIRECTORA`, { align: 'center' });
    document.image('./assets/firma.png', 250, 530, { width: 120 });
    document.image('./assets/SELLO.png', 200, 520, { width: 100 });
}
exports.GenerateCertificadoConducta = GenerateCertificadoConducta;
