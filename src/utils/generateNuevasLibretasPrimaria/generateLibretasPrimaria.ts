import { Periodo } from '../../types/alumno'
import { CURSO_SALON } from '../../types/cursos'
import { Grado, Nivel, Seccion, Year } from '../../types/enums'
import { RecordNotas } from '../../types/notas'
import { conclusionesDescriptivasTabla, escalaCalificaciones, firmas, resumenAsistencias } from '../generarBoletaNotas/utils/utils'
import { AddHeaders, addNotas } from './utils'

export default function generateLibretaPrimariaPDF({
  doc,
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
  doc: PDFKit.PDFDocument
  tutor: string
  nivel: Nivel
  grado: Grado
  seccion: Seccion
  year: Year
  notas: RecordNotas
  periodo: Periodo | undefined
}) {
  doc.addPage()

  AddHeaders({ doc, tutor, nivel, year, grado, seccion, alumno: notas.alumno })
  addNotas({ doc, notas, cursosSalon, periodo })

  doc.addPage()
  conclusionesDescriptivasTabla({ document: doc, conclusionesDescriptivas: notas.conclusionesDescriptivas })
  resumenAsistencias({ document: doc, inasistencias: notas.inasistencias, tardanzas: notas.tardanzas })
  escalaCalificaciones(doc)
  firmas({ document: doc })
}
