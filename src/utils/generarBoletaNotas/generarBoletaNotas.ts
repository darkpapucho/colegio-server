import PdfDocument from 'pdfkit'
import { ExtendedRegistroNota } from '../../types/documents'
import { Grado, Nivel, Seccion, Year } from '../../types/enums'
import { generarBoletasNotasInicial, generarBoletasNotasPrimaria } from './utils/generator'
import archiver from 'archiver'
import { PassThrough } from 'stream'
import { Response } from 'express'
export default function generarBoletasDeNotasPdf({ registros, res, year, nivel }: { nivel: Nivel; year: Year; res: Response; registros: ExtendedRegistroNota[] }) {
  const libretas = new PdfDocument({
    layout: 'portrait',
    size: 'A4',
    font: 'Courier',
    margins: { top: 20, left: 20, right: 20, bottom: 20 },
    autoFirstPage: false,
  })
  // libretas.pipe(fs.createWriteStream('./files/libreta.pdf'))
  libretas.pipe(res)

  if (registros.length === 0) {
    libretas.addPage()
    libretas.text('NO HAY ALUMNOS EN ESTE AÑO/SALÓN', 0, 100, {
      width: 600,
      align: 'center',
    })
    libretas.end()
    return
  }

  registros.forEach((registro) => {
    //document.addPage()
    fillDataInBoletaNotaPerStudent({ document: libretas, registro, year, nivel })
  })
  libretas.end()
}

export function fillDataInBoletaNotaPerStudent({ document, registro, year, nivel }: { document: PDFKit.PDFDocument; registro: ExtendedRegistroNota; year: Year; nivel: Nivel }) {
  document.addPage()
  document.fontSize(14).text(`INFORME DE PROGRESO DEL APRENDIZAJE DEL ESTUDIANTE ${year}`, 0, 30, { width: 600, align: 'center', stroke: true })
  document.image('./assets/logo2.png', 435, 73, { width: 80 })

  if (nivel === 'primaria') {
    generarBoletasNotasPrimaria({ document, registro, nivel })
  } else if (nivel === 'inicial') {
    generarBoletasNotasInicial({ document, registro, nivel })
  }
}

export function generatePDFBuffer({ nivel, year, registro }: { registro: ExtendedRegistroNota; year: Year; nivel: Nivel }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdfBuffer: Buffer[] = []
    const pdfDocument = new PdfDocument({ layout: 'portrait', size: 'A4', font: 'Courier', margins: { top: 20, left: 20, right: 20, bottom: 20 }, autoFirstPage: false })
    pdfDocument.on('data', (data: Buffer) => pdfBuffer.push(data))
    pdfDocument.on('end', () => resolve(Buffer.concat(pdfBuffer)))
    pdfDocument.on('error', (err: unknown) => reject(err))
    fillDataInBoletaNotaPerStudent({ nivel, year, registro, document: pdfDocument })
    pdfDocument.end()
  })
}

export async function createStudentZipInMemory({ registros, nivel, year, grado, seccion, res }: { registros: ExtendedRegistroNota[]; res: Response; nivel: Nivel; year: Year; grado: Grado; seccion: Seccion }) {
  const zipFile = archiver('zip', { zlib: { level: 9 } })
  const tempStream = new PassThrough()
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename=Notas-${grado}-${seccion}`)

  zipFile.pipe(tempStream)
  tempStream.pipe(res)

  for (const registro of registros) {
    const pdfBuffer = await generatePDFBuffer({ nivel, year, registro })
    zipFile.append(pdfBuffer, { name: `${registro.estudiante[0].nombreCompleto}.pdf` })
  }
  await zipFile.finalize()
}
