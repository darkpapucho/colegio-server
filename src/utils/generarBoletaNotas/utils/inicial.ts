import { CursoNotaRecord } from '../../../types/documents'
import { Grado } from '../../../types/enums'
import { CURSOS_INICIAL_3_4_BOLETA_NOTAS, CURSOS_INICIAL_5_BOLETA_NOTAS, ESPACIOS_ENTRE_CURSOS_INICIAL, NUMERO_COMPETENCIAS_3_4_INICIAL, NUMERO_COMPETENCIAS_5_INICIAL } from '../../../vars/constants'
import { convertPeriodoKeyToIndex } from './utils'
import { BOLD_FONT, BORDER_COLOR, COMPETENCIA_CELDA_WIDTH, CONCLUSION_DESCRIPTIVA_CELDA_WIDTH, CURSO_CELDA_WIDTH, FILL_COLOR, HEADER_FONT_COLOR, MARGIN_LEFT, NORMAL_FONT, NOTAS_TABLE_HEADER_HEIGHT, NOTAS_TABLE_WIDTH, NOTA_CELDA_HEIGHT, NOTA_CELDA_WIDTH, TEXT_COLOR } from './vars'

export function tablaNotasEstructuraInicial({ document, grado }: { document: PDFKit.PDFDocument; grado: Grado }) {
  if (grado === 'Grupo 5 años') {
    let count = 0
    document.rect(MARGIN_LEFT, 200, NOTAS_TABLE_WIDTH, NOTAS_TABLE_HEADER_HEIGHT + NUMERO_COMPETENCIAS_5_INICIAL * NOTA_CELDA_HEIGHT).stroke() //316+66 MARCO DEL RECTANGULO GRANDE
    document.rect(MARGIN_LEFT, 200, NOTAS_TABLE_WIDTH, NOTAS_TABLE_HEADER_HEIGHT).fillOpacity(0.5).fillAndStroke(FILL_COLOR, BORDER_COLOR) //RELLENO DEL RECTANGULO HEADER
    document
      .rect(MARGIN_LEFT, 200 + NOTAS_TABLE_HEADER_HEIGHT, CURSO_CELDA_WIDTH, NUMERO_COMPETENCIAS_5_INICIAL * NOTA_CELDA_HEIGHT)
      .fillOpacity(0.5)
      .fillAndStroke(FILL_COLOR, BORDER_COLOR)
    document.fillOpacity(1)

    document
      .moveTo(145, 200)
      .lineTo(145, 200 + NOTAS_TABLE_HEADER_HEIGHT)
      .stroke(BORDER_COLOR) //primera columna
    document
      .moveTo(315, 200)
      .lineTo(315, 200 + NOTAS_TABLE_HEADER_HEIGHT + NUMERO_COMPETENCIAS_5_INICIAL * NOTA_CELDA_HEIGHT)
      .stroke(BORDER_COLOR) //segunda columna

    for (let i = 0; i < 3; i++) {
      document
        .moveTo(345 + count, 215)
        .lineTo(345 + count, 215 + NOTAS_TABLE_HEADER_HEIGHT / 2 + NUMERO_COMPETENCIAS_5_INICIAL * NOTA_CELDA_HEIGHT)
        .stroke(BORDER_COLOR) //3 columnas calificativo por periodo, se van corriendo 30 a la derecha

      document
        .moveTo(345 + count + NOTA_CELDA_WIDTH * 3, 200)
        .lineTo(345 + count + NOTA_CELDA_WIDTH * 3, 200 + NOTAS_TABLE_HEADER_HEIGHT + NUMERO_COMPETENCIAS_5_INICIAL * NOTA_CELDA_HEIGHT)
        .stroke(BORDER_COLOR) // 3 ultimas columnas, continua corriendo 30 a la derecha
      count += NOTA_CELDA_WIDTH
    }

    // linea q divide calificativo por periodo
    document
      .moveTo(315, 215)
      .lineTo(315 + NOTA_CELDA_WIDTH * 4, 215)
      .stroke(BORDER_COLOR)

    count = 0

    //lineas horizontales de las competencias
    for (let i = 0; i < NUMERO_COMPETENCIAS_5_INICIAL - 1; i++) {
      document
        .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT + NOTA_CELDA_HEIGHT + count) //145
        .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 5 * NOTA_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT + NOTA_CELDA_HEIGHT + count) //315+150
        .stroke(BORDER_COLOR)
      count += NOTA_CELDA_HEIGHT
    }

    //lineas horizontales de los cursos
    let initialHeight = 230
    for (const curso of CURSOS_INICIAL_5_BOLETA_NOTAS) {
      document
        .moveTo(MARGIN_LEFT, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .stroke()
      document
        .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 5 * NOTA_CELDA_WIDTH, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 5 * NOTA_CELDA_WIDTH + NOTA_CELDA_WIDTH + CONCLUSION_DESCRIPTIVA_CELDA_WIDTH, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .stroke()
      initialHeight += NOTA_CELDA_HEIGHT * curso.competencias.length
    }
  } else {
    let count = 0
    document.rect(MARGIN_LEFT, 200, NOTAS_TABLE_WIDTH, NOTAS_TABLE_HEADER_HEIGHT + NUMERO_COMPETENCIAS_3_4_INICIAL * NOTA_CELDA_HEIGHT).stroke() //316+66 MARCO DEL RECTANGULO GRANDE
    document.rect(MARGIN_LEFT, 200, NOTAS_TABLE_WIDTH, NOTAS_TABLE_HEADER_HEIGHT).fillOpacity(0.5).fillAndStroke(FILL_COLOR, BORDER_COLOR) //RELLENO DEL RECTANGULO HEADER
    document
      .rect(MARGIN_LEFT, 200 + NOTAS_TABLE_HEADER_HEIGHT, CURSO_CELDA_WIDTH, NUMERO_COMPETENCIAS_3_4_INICIAL * NOTA_CELDA_HEIGHT)
      .fillOpacity(0.5)
      .fillAndStroke(FILL_COLOR, BORDER_COLOR)
    document.fillOpacity(1)

    document
      .moveTo(145, 200)
      .lineTo(145, 200 + NOTAS_TABLE_HEADER_HEIGHT)
      .stroke(BORDER_COLOR) //primera columna
    document
      .moveTo(315, 200)
      .lineTo(315, 200 + NOTAS_TABLE_HEADER_HEIGHT + NUMERO_COMPETENCIAS_3_4_INICIAL * NOTA_CELDA_HEIGHT)
      .stroke(BORDER_COLOR) //segunda columna

    for (let i = 0; i < 3; i++) {
      document
        .moveTo(345 + count, 215)
        .lineTo(345 + count, 215 + NOTAS_TABLE_HEADER_HEIGHT / 2 + NUMERO_COMPETENCIAS_3_4_INICIAL * NOTA_CELDA_HEIGHT)
        .stroke(BORDER_COLOR) //3 columnas calificativo por periodo, se van corriendo 30 a la derecha

      document
        .moveTo(345 + count + NOTA_CELDA_WIDTH * 3, 200)
        .lineTo(345 + count + NOTA_CELDA_WIDTH * 3, 200 + NOTAS_TABLE_HEADER_HEIGHT + NUMERO_COMPETENCIAS_3_4_INICIAL * NOTA_CELDA_HEIGHT)
        .stroke(BORDER_COLOR) // 3 ultimas columnas, continua corriendo 30 a la derecha
      count += NOTA_CELDA_WIDTH
    }
    // linea q divide calificativo por periodo
    document
      .moveTo(315, 215)
      .lineTo(315 + NOTA_CELDA_WIDTH * 4, 215)
      .stroke(BORDER_COLOR)

    count = 0
    //lineas horizontales de las competencias
    for (let i = 0; i < NUMERO_COMPETENCIAS_3_4_INICIAL - 1; i++) {
      document
        .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT + NOTA_CELDA_HEIGHT + count) //145
        .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 5 * NOTA_CELDA_WIDTH, 200 + NOTAS_TABLE_HEADER_HEIGHT + NOTA_CELDA_HEIGHT + count) //315+150
        .stroke(BORDER_COLOR)
      count += NOTA_CELDA_HEIGHT
    }

    //lineas horizontales de los cursos
    let initialHeight = 230
    for (const curso of CURSOS_INICIAL_3_4_BOLETA_NOTAS) {
      document
        .moveTo(MARGIN_LEFT, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .stroke()
      document
        .moveTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 5 * NOTA_CELDA_WIDTH, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .lineTo(MARGIN_LEFT + CURSO_CELDA_WIDTH + COMPETENCIA_CELDA_WIDTH + 5 * NOTA_CELDA_WIDTH + NOTA_CELDA_WIDTH + CONCLUSION_DESCRIPTIVA_CELDA_WIDTH, initialHeight + NOTA_CELDA_HEIGHT * curso.competencias.length)
        .stroke()
      initialHeight += NOTA_CELDA_HEIGHT * curso.competencias.length
    }
  }
}

export function tablaNotasCamposInicial({ document, grado }: { document: PDFKit.PDFDocument; grado: Grado }) {
  if (grado === 'Grupo 5 años') {
    let count = 0
    document.font(NORMAL_FONT).fill(TEXT_COLOR)

    for (let curso of CURSOS_INICIAL_5_BOLETA_NOTAS) {
      for (let i = 0; i < curso.competencias.length; i++) {
        document.fontSize(7).text(curso.competencias[i], 150, 235 + count, { width: 160, align: 'left' })
        count += NOTA_CELDA_HEIGHT
      }
    }
    //HEADERS
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
    for (const curso of CURSOS_INICIAL_5_BOLETA_NOTAS) {
      if (!ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key]) throw new Error('ERROR PROCESANDO LIBRETA DE NOTAS: CURSO INVÁLIDO')
      document.fontSize(8).text(curso.label, 52, 228 + ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key], { width: 91, align: 'center' })
    }
  } else {
    let count = 0
    //imprimir todas las competencias de todos los cursos
    document.font(NORMAL_FONT).fill(TEXT_COLOR)
    for (const curso of CURSOS_INICIAL_3_4_BOLETA_NOTAS) {
      for (let i = 0; i < curso.competencias.length; i++) {
        document.fontSize(7).text(curso.competencias[i], 150, 235 + count, { width: 160, align: 'left' })
        count += NOTA_CELDA_HEIGHT
      }
    }
    //HEADERS
    document.fill(HEADER_FONT_COLOR).font(BOLD_FONT)
    document.fontSize(8).text('ÁREA CURRICULAR', 50, 213, { width: 95, align: 'center' })
    document.fontSize(8).text('COMPETENCIAS', 145, 213, { width: 170, align: 'center' })
    document.fontSize(7).text('CALIFICATIVO POR PERIODO', 315, 205, { width: 120, align: 'center' })
    document.fontSize(7).text('1', 315, 220, { width: 30, align: 'center' })
    document.fontSize(7).text('2', 345, 220, { width: 30, align: 'center' })
    document.fontSize(7).text('3', 375, 220, { width: 30, align: 'center' })
    document.fontSize(7).text('4', 405, 220, { width: 30, align: 'center' })
    document.fontSize(5).text('Calif. anual de comp.', 435, 208, { width: 30, align: 'center' })
    document.fontSize(5).text('Calif. anual de área.', 465, 208, { width: 30, align: 'center' })
    document.fontSize(7).text('Conclusión descriptiva', 495, 210, { width: 56, align: 'center' })
    //nombres de los cursos
    for (const curso of CURSOS_INICIAL_5_BOLETA_NOTAS) {
      if (!ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key]) throw new Error('ERROR PROCESANDO LIBRETA DE NOTAS: CURSO INVÁLIDO')
      document.fontSize(8).text(curso.label, 52, 228 + ESPACIOS_ENTRE_CURSOS_INICIAL[curso.key], { width: 91, align: 'center' })
    }
  }
}

//notas de los cursos
export function tablaNotasDatosInicial({ document, cursos, grado }: { grado: Grado; document: PDFKit.PDFDocument; cursos: { [key: string]: CursoNotaRecord } }) {
  //inicial
  const PERIODOS: (keyof Omit<CursoNotaRecord, 'numCompetencias'>)[] = ['primerPeriodo', 'segundoPeriodo', 'tercerPeriodo', 'cuartoPeriodo']
  document.fill(TEXT_COLOR).font(NORMAL_FONT)
  if (grado === 'Grupo 5 años') {
    let count = 0
    for (const periodo of PERIODOS) {
      for (const CURSO_INICIAL_5 of CURSOS_INICIAL_5_BOLETA_NOTAS) {
        for (let i = 0; i < cursos[CURSO_INICIAL_5.key].numCompetencias; i++) {
          //una nota por cada competencia
          document.fontSize(9).text(cursos[CURSO_INICIAL_5.key][periodo][i] ? cursos[CURSO_INICIAL_5.key][periodo][i] : ' ', 315 + NOTA_CELDA_WIDTH * convertPeriodoKeyToIndex(periodo), 237 + count, { width: 30, align: 'center' })
          count += NOTA_CELDA_HEIGHT
        }
      }
      count = 0
    }
  } else {
    let count = 0
    for (const periodo of PERIODOS) {
      for (const CURSO_INICIAL_3_4 of CURSOS_INICIAL_3_4_BOLETA_NOTAS) {
        for (let i = 0; i < cursos[CURSO_INICIAL_3_4.key].numCompetencias; i++) {
          document.fontSize(9).text(cursos[CURSO_INICIAL_3_4.key][periodo][i] ? cursos[CURSO_INICIAL_3_4.key][periodo][i] : ' ', 315 + NOTA_CELDA_WIDTH * convertPeriodoKeyToIndex(periodo), 237 + count, { width: 30, align: 'center' })
          count += NOTA_CELDA_HEIGHT
        }
      }
      count = 0
    }
  }
}
