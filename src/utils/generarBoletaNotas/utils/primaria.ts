import { CursoNotaRecord } from '../../../types/documents'
import { Grado, Nivel, Seccion } from '../../../types/enums'
import { CURSOS_PRIMARIA_BOLETA_NOTAS, ESPACIOS_ENTRE_CURSOS_PRIMARIA, NUMERO_COMPETENCIAS_PRIMARIA } from '../../../vars/constants'
import { convertPeriodoKeyToIndex } from './utils'
import {
  BOLD_FONT,
  BOLETA_NOTA_HEADERS,
  BORDER_COLOR,
  NOTA_CELDA_HEIGHT,
  DRE,
  FILL_COLOR,
  HEADER_FONT_COLOR,
  HEADER_COLOR_CONTENT,
  NOMBRE_COLEGIO,
  NORMAL_FONT,
  TEXT_COLOR,
  UGEL,
  NOTA_CELDA_WIDTH,
  TABLE_NOTAS_HEIGHT,
  TABLE_NOTAS_WIDTH,
  MARGIN_LEFT,
  NOTAS_TABLE_HEADER_HEIGHT,
  CURSO_CELDA_WIDTH,
  COMPETENCIA_CELDA_WIDTH,
  CONCLUSION_DESCRIPTIVA_CELDA_WIDTH,
} from './vars'

export function tableHead(document: PDFKit.PDFDocument) {
  document.rect(50, 70, 330, 105).stroke()
  document.rect(50, 70, 120, 105).fillOpacity(0.5).fillAndStroke(FILL_COLOR, BORDER_COLOR)
  document.fillOpacity(1)
  let count = 0
  for (let i = 0; i < 6; i++) {
    document
      .moveTo(50, 85 + count)
      .lineTo(380, 85 + count)
      .stroke()
    count += 15
  }
  document.moveTo(170, 70).lineTo(170, 175).stroke()
}

export function tableHeadData({ document, nivel, grado, seccion, nombreCompleto }: { document: PDFKit.PDFDocument; nivel: Nivel; grado: Grado; seccion: Seccion; nombreCompleto: string }) {
  document.fill(HEADER_FONT_COLOR)
  document.font(BOLD_FONT)
  let count = 0

  for (const header of BOLETA_NOTA_HEADERS) {
    document.fontSize(8).text(header, 50, 75 + count, { width: 115, align: 'right' })
    count += 15
  }
  count = 0
  document.fill(HEADER_COLOR_CONTENT).font(NORMAL_FONT)
  const BOLETA_NOTA_HEADERS_CONTENT = [DRE, UGEL, nivel, NOMBRE_COLEGIO, grado, seccion, nombreCompleto]
  for (const content of BOLETA_NOTA_HEADERS_CONTENT) {
    document.fontSize(8).text(content, 175, 75 + count, { width: 205, align: 'left' })
    count += 15
  }
}

export function tablaNotasEstructuraPrimaria(document: PDFKit.PDFDocument) {
  document.rect(MARGIN_LEFT, 200, TABLE_NOTAS_WIDTH, TABLE_NOTAS_HEIGHT).stroke()
  document.rect(MARGIN_LEFT, 200, TABLE_NOTAS_WIDTH, NOTAS_TABLE_HEADER_HEIGHT).fillOpacity(0.5).fillAndStroke(FILL_COLOR, BORDER_COLOR)
  document
    .rect(MARGIN_LEFT, 200 + NOTAS_TABLE_HEADER_HEIGHT, CURSO_CELDA_WIDTH, NUMERO_COMPETENCIAS_PRIMARIA * NOTA_CELDA_HEIGHT)
    .fillOpacity(0.5)
    .fillAndStroke(FILL_COLOR, BORDER_COLOR)

  //LINEAS HORIZONTALES
  document.fillOpacity(1)
  document
    .moveTo(MARGIN_LEFT, 200 + NOTAS_TABLE_HEADER_HEIGHT)
    .lineTo(MARGIN_LEFT + TABLE_NOTAS_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT)
    .stroke()
  //LIVENAS VERTICALES (TABLE HEIGHT)
  document
    .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, 200)
    .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, 200 + TABLE_NOTAS_HEIGHT)
    .stroke()
  document
    .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH, 200)
    .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH, 200 + TABLE_NOTAS_HEIGHT)
    .stroke()

  let count = 0
  for (let i = 0; i < 3; i++) {
    document
      .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + NOTA_CELDA_WIDTH + count, 200 + NOTAS_TABLE_HEADER_HEIGHT / 2)
      .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + NOTA_CELDA_WIDTH + count, 200 + TABLE_NOTAS_HEIGHT)
      .stroke()
    document
      .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + NOTA_CELDA_WIDTH + count + 3 * NOTA_CELDA_WIDTH, 200)
      .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + NOTA_CELDA_WIDTH + count + 3 * NOTA_CELDA_WIDTH, 200 + TABLE_NOTAS_HEIGHT)
      .stroke()
    count += 30
  }
  //LINEA QUE DIVIDE EN DOS CALIFICATIVO POR PERIODOS
  document
    .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT / 2)
    .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 4 * NOTA_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT / 2)
    .stroke()

  //LINEAS HORIZONTALES POR COMPETENCIAS
  count = 0
  for (let i = 0; i < NUMERO_COMPETENCIAS_PRIMARIA - 1; i++) {
    document
      .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT + NOTA_CELDA_HEIGHT + count)
      .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 5 * NOTA_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT + NOTA_CELDA_HEIGHT + count)
      .stroke()
    count += NOTA_CELDA_HEIGHT
  }
  //lineas horizontales por curso
  let initialHeight = 200 + NOTAS_TABLE_HEADER_HEIGHT
  for (const curso of CURSOS_PRIMARIA_BOLETA_NOTAS) {
    document
      .moveTo(MARGIN_LEFT, initialHeight + curso.competencias.length * NOTA_CELDA_HEIGHT)
      .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, initialHeight + curso.competencias.length * NOTA_CELDA_HEIGHT)
      .stroke()
    document
      .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + NOTA_CELDA_WIDTH * 5, initialHeight + curso.competencias.length * NOTA_CELDA_HEIGHT)
      .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + NOTA_CELDA_WIDTH * 6 + CONCLUSION_DESCRIPTIVA_CELDA_WIDTH, initialHeight + curso.competencias.length * NOTA_CELDA_HEIGHT)
      .stroke()
    initialHeight += curso.competencias.length * NOTA_CELDA_HEIGHT
  }
}

export function tablaNotasCamposPrimaria(document: PDFKit.PDFDocument) {
  let count = 0
  count = 0
  document.fill(TEXT_COLOR).font(NORMAL_FONT)
  //competencias de los cursos
  for (const curso of CURSOS_PRIMARIA_BOLETA_NOTAS) {
    for (const competencia of curso.competencias) {
      document.fontSize(7).text(competencia, 150, 235 + count, { width: 160, align: 'left' })
      count += NOTA_CELDA_HEIGHT
    }
  }
  //encabezados de la tabla
  document.fill(HEADER_FONT_COLOR).font(BOLD_FONT)
  document.fontSize(8).text('ÁREA CURRICULAR', 50, 213, { width: 95, align: 'center' })
  document.fontSize(12).text('COMPETENCIAS', 145, 210, { width: 170, align: 'center' })
  document.fontSize(7).text('CALIFICATIVO POR PERIODO', 315, 205, { width: 120, align: 'center' })
  document.fontSize(7).text('1', 315, 220, { width: 30, align: 'center' })
  document.fontSize(7).text('2', 345, 220, { width: 30, align: 'center' })
  document.fontSize(7).text('3', 375, 220, { width: 30, align: 'center' })
  document.fontSize(7).text('4', 405, 220, { width: 30, align: 'center' })
  document.fontSize(5).text('Calif. anual de comp.', 435, 208, { width: 30, align: 'center' })
  document.fontSize(5).text('Calif. anual de área.', 465, 208, { width: 30, align: 'center' })
  document.fontSize(7).text('Conclusión descriptiva', 495, 210, { width: 56, align: 'center' })

  //nombres de los cursos
  document.fontSize(8)
  count = 0
  for (const curso of CURSOS_PRIMARIA_BOLETA_NOTAS) {
    if (!ESPACIOS_ENTRE_CURSOS_PRIMARIA[curso.key]) throw new Error('ERROR PROCESANDO LIBRETA DE NOTAS: CURSO INVÁLIDO')
    document.fontSize(8).text(curso.label, 52, 228 + ESPACIOS_ENTRE_CURSOS_PRIMARIA[curso.key], { width: 91, align: 'center' })
  }
}

export function tablaNotasDatosPrimaria({ document, cursos }: { document: PDFKit.PDFDocument; cursos: { [key: string]: CursoNotaRecord } }) {
  document.fill(TEXT_COLOR).font(NORMAL_FONT)
  let count = 0
  const PERIODOS: (keyof Omit<CursoNotaRecord, 'numCompetencias'>)[] = ['primerPeriodo', 'segundoPeriodo', 'tercerPeriodo', 'cuartoPeriodo']
  for (const periodo of PERIODOS) {
    for (const CURSO_PRIMARIA of CURSOS_PRIMARIA_BOLETA_NOTAS) {
      for (let i = 0; i < cursos[CURSO_PRIMARIA.key].numCompetencias; i++) {
        document.fontSize(9).text(cursos[CURSO_PRIMARIA.key][periodo][i] ? cursos[CURSO_PRIMARIA.key][periodo][i] : ' ', 315 + NOTA_CELDA_WIDTH * convertPeriodoKeyToIndex(periodo), 237 + count, { width: 30, align: 'center' })
        count += NOTA_CELDA_HEIGHT
      }
    }
    count = 0
  }
}
