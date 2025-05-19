import archiver from 'archiver'
import { Periodo } from '../../types/alumno'
import { CURSO_SALON } from '../../types/cursos'
import { Nivel, Grado, Seccion, Year } from '../../types/enums'
import { RecordNotas } from '../../types/notas'
import generateLibretaPrimariaPDF from './generateLibretasPrimaria'
import PdfDocument from 'pdfkit'
import { Response } from 'express'

export async function zipLibretasPrimaria({
  res,
  tutor,
  nivel,
  grado,
  seccion,
  year,
  registro,
  cursosSalon,
  periodo,
}: {
  res: Response
  cursosSalon: CURSO_SALON[]
  tutor: string
  nivel: Nivel
  grado: Grado
  seccion: Seccion
  year: Year
  registro: RecordNotas[]
  periodo: Periodo | undefined
}) {
  const zipFile = archiver('zip', { zlib: { level: 9 } })
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename=Notas-${grado}-${seccion}`)
  zipFile.pipe(res)
  for (const notas of registro) {
    const buffer = await libretasPrimariaBuffer({
      tutor,
      nivel,
      grado,
      seccion,
      year,
      notas,
      cursosSalon,
      periodo,
    })
    zipFile.append(buffer, { name: `${notas.alumno}.pdf` })
  }
  await zipFile.finalize()
}

export function libretasPrimariaBuffer({
  tutor,
  nivel,
  grado,
  seccion,
  year,
  notas,
  cursosSalon,
  periodo,
}: {
  cursosSalon: CURSO_SALON[]
  tutor: string
  nivel: Nivel
  grado: Grado
  seccion: Seccion
  year: Year
  notas: RecordNotas
  periodo: Periodo | undefined
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const pdfBuffer: Buffer[] = []
    const doc = new PdfDocument({ layout: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 }, autoFirstPage: false, size: 'A4' })
    doc.on('data', (chunk) => pdfBuffer.push(chunk))
    doc.on('error', (err: unknown) => reject(err))
    doc.on('end', () => resolve(Buffer.concat(pdfBuffer)))

    generateLibretaPrimariaPDF({
      doc,
      tutor,
      nivel,
      grado,
      seccion,
      year,
      notas,
      cursosSalon,
      periodo,
    })
    doc.end()
  })
}
