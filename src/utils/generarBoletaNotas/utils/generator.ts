import { ExtendedRegistroNota } from '../../../types/documents'
import { Nivel } from '../../../types/enums'
import { tablaNotasCamposInicial, tablaNotasDatosInicial, tablaNotasEstructuraInicial } from './inicial'
import { tablaNotasCamposPrimaria, tablaNotasDatosPrimaria, tablaNotasEstructuraPrimaria, tableHead, tableHeadData } from './primaria'
import { conclusionesDescriptivasTabla, escalaCalificaciones, firmas, resumenAsistencias, tablaNotasPromedios } from './utils'

export const generarBoletasNotasPrimaria = ({ document, registro, nivel }: { document: PDFKit.PDFDocument; registro: ExtendedRegistroNota; nivel: Nivel }) => {
  const { estudiante, cursos, conclusionesDescriptivas, inasistencias, tardanzas } = registro

  const { grado, seccion, nombreCompleto } = estudiante[0]
  //parte de adelante

  tableHead(document)
  tableHeadData({ document, nivel, grado, seccion, nombreCompleto })
  tablaNotasEstructuraPrimaria(document)
  tablaNotasCamposPrimaria(document)
  tablaNotasDatosPrimaria({ document, cursos })
  tablaNotasPromedios({ document, cursos, nivel, grado }) //modified
  //PARTE DE ATRAS DE LA HOJA
  conclusionesDescriptivasTabla({ document, conclusionesDescriptivas })
  resumenAsistencias({ document, inasistencias, tardanzas })
  escalaCalificaciones(document)
  firmas({ document })
}

export const generarBoletasNotasInicial = ({ document, registro, nivel }: { nivel: Nivel; registro: ExtendedRegistroNota; document: PDFKit.PDFDocument }) => {
  const { estudiante, cursos, conclusionesDescriptivas, inasistencias, tardanzas } = registro
  const { grado, seccion, nombreCompleto } = estudiante[0]

  tableHead(document)
  tableHeadData({ document, nivel, grado, seccion, nombreCompleto })
  tablaNotasEstructuraInicial({ document, grado })
  tablaNotasCamposInicial({ document, grado })
  tablaNotasDatosInicial({ document, cursos, grado })

  tablaNotasPromedios({ document, cursos, nivel, grado }) //modified
  //PARTE DE ATRAS DE LA HOJA
  document.addPage()
  conclusionesDescriptivasTabla({ document, conclusionesDescriptivas })
  resumenAsistencias({ document, inasistencias, tardanzas })
  escalaCalificaciones(document)
  firmas({ document })
}
