import { ExtendedRegistroNota } from '../../../types/documents'
import { Nivel } from '../../../types/enums'
import { tablaNotasCamposInicial, tablaNotasDatosInicial, tablaNotasEstructuraInicial } from './inicial'
import { tablaNotasCamposPrimaria, tablaNotasDatosPrimaria, tablaNotasEstructuraPrimaria, tableHead, tableHeadData } from './primaria'
import { conclusionesDescriptivasTabla, escalaCalificaciones, firmas, resumenAsistencias, tablaNotasPromedios } from './utils'

export const generarBoletasNotasPrimaria = ({ document, registro, nivel }: { document: PDFKit.PDFDocument; registro: ExtendedRegistroNota; nivel: Nivel }) => {
  const { estudiante, cursos, conclusionesDescriptivas, inasistencias, tardanzas } = registro
  // const {personalSocial, educacionFisica,comunicacion, arteCultura, ingles, matematica, cienciaTecnologia, religion, competenciasTransversales} = cursos;
  // const notas = {personalSocial, educacionFisica,comunicacion, arteCultura, ingles, matematica, cienciaTecnologia, religion, competenciasTransversales};
  const { grado, seccion, nombreCompleto } = estudiante[0]

  tableHead(document)
  tableHeadData({ document, nivel, grado, seccion, nombreCompleto })
  tablaNotasEstructuraPrimaria(document)
  tablaNotasCamposPrimaria(document)
  tablaNotasDatosPrimaria({ document, cursos })
  // if(tipo==="anual"){
  //   tablaNotasPromedios(pdfDoc, notas,nivel,grado);
  // }
  tablaNotasPromedios({ document, cursos, nivel, grado }) //modified
  conclusionesDescriptivasTabla({ document: document, conclusionesDescriptivas })
  resumenAsistencias({ document, inasistencias, tardanzas })
  escalaCalificaciones(document)
  firmas({ document })
}

export const generarBoletasNotasInicial = ({ document, registro, nivel }: { nivel: Nivel; registro: ExtendedRegistroNota; document: PDFKit.PDFDocument }) => {
  const { estudiante, cursos, conclusionesDescriptivas, inasistencias, tardanzas } = registro
  const { grado, seccion, nombreCompleto } = estudiante[0]
  // if (grado === 'Grupo 5 años') {
  //   notas = { personalSocial, psicomotriz, comunicacion, matematica, cienciaTecnologia, competenciasTransversales };
  // } else {
  //   notas = { personalSocial, psicomotriz, comunicacion, matematica, cienciaTecnologia };
  // }
  tableHead(document)
  tableHeadData({ document, nivel, grado, seccion, nombreCompleto })
  tablaNotasEstructuraInicial({ document, grado })
  tablaNotasCamposInicial({ document, grado })
  tablaNotasDatosInicial({ document, cursos, grado })
  // if (tipo === 'anual') {
  //   tablaNotasPromedios(document, notas, nivel, grado);
  // }
  tablaNotasPromedios({ document, cursos, nivel, grado }) //modified
  conclusionesDescriptivasTabla({ document, conclusionesDescriptivas })
  resumenAsistencias({ document, inasistencias, tardanzas })
  escalaCalificaciones(document)
  firmas({ document })
}
