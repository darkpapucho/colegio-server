import { Month } from '../types/asistencia'
import { Grado, Nivel, Seccion } from '../types/enums'
import { PensionRecord } from '../types/pensiones'
import { parseMonthNameToMonthNumber1to12 } from '../vars/periodosDates'
import { drawCell } from './drawCellTable'
import { NOMBRE_COLEGIO } from './generarBoletaNotas/utils/vars'

// import { PensionRecord } from '../types/pensiones'
const HEADER_CELL_HEIGHT = 34
const BODY_CELL_HEIGHT = 20
const TABLE_BEGIN = { x: 20, y: 70 }

const BEGIN = { x: 20, y: 20 }
const CELL_HEIGHT = 20
const CELL_WIDTH = 100
const CELL_WIDTH_DATA = 180

type HeaderInfo = { label: string; width: number; fontSize?: number; textVerticalOffSet?: number }

const pensionesTableHeaders: { primerSemestre: HeaderInfo[]; segundoSemestre: HeaderInfo[] } = {
  primerSemestre: [
    {
      label: 'ALUMNO',
      width: 200,
      fontSize: 16,
      textVerticalOffSet: HEADER_CELL_HEIGHT / 2 - 6,
    },
    {
      label: 'Marzo',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Abril',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Mayo',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Junio',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Julio',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
  ],
  segundoSemestre: [
    {
      label: 'Alumno',
      width: 200,
      fontSize: 16,
      textVerticalOffSet: HEADER_CELL_HEIGHT / 2 - 6,
    },
    {
      label: 'Agosto',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Septiembre',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Octubre',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Noviembre',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
    {
      label: 'Diciembre',
      width: 110,
      fontSize: 10,
      textVerticalOffSet: 4,
    },
  ],
}

export function generatePensionTablePdf(
  pdf: PDFKit.PDFDocument,
  list: {
    nombreCompleto: string
    pensiones: PensionRecord[]
  }[],
  { nivel, grado, seccion, semestre }: { nivel: Nivel; grado: Grado; seccion: Seccion; semestre: 1 | 2 },
) {
  drawSchoolData(pdf, { nivel, grado, seccion })
  drawTableHeaders(pdf, semestre)
  //body:
  drawTableBodyData(pdf, { list, semestre })
}

function drawSchoolData(document: PDFKit.PDFDocument, { nivel, grado, seccion }: { nivel: Nivel; grado: Grado; seccion: Seccion }) {
  drawCell(document, { begin: { x: BEGIN.x, y: BEGIN.y }, height: 20, width: CELL_WIDTH, content: `  COLEGIO`, options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' } })
  drawCell(document, {
    begin: { x: BEGIN.x, y: BEGIN.y + CELL_HEIGHT },
    height: 20,
    width: CELL_WIDTH,
    content: `  NIVEL`,
    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
  })
  drawCell(document, {
    begin: { x: BEGIN.x + CELL_WIDTH, y: BEGIN.y },
    height: 20,
    width: CELL_WIDTH_DATA,
    content: `  ${NOMBRE_COLEGIO.toUpperCase()}`,
    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
  })
  drawCell(document, {
    begin: { x: BEGIN.x + CELL_WIDTH, y: BEGIN.y + CELL_HEIGHT },
    height: 20,
    width: CELL_WIDTH_DATA,
    content: `  ${nivel.toUpperCase()}`,
    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
  })
  //###########################
  drawCell(document, {
    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA, y: BEGIN.y },
    height: 20,
    width: CELL_WIDTH_DATA,
    content: `  GRADO`,
    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
  })
  drawCell(document, {
    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA, y: BEGIN.y + CELL_HEIGHT },
    height: 20,
    width: CELL_WIDTH,
    content: `  SECCIÓN`,
    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left', fillColor: '#dedede' },
  })
  drawCell(document, {
    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA + CELL_WIDTH, y: BEGIN.y },
    height: 20,
    width: CELL_WIDTH,
    content: `  ${grado}`,
    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
  })
  drawCell(document, {
    begin: { x: BEGIN.x + CELL_WIDTH + CELL_WIDTH_DATA + CELL_WIDTH, y: BEGIN.y + CELL_HEIGHT },
    height: 20,
    width: CELL_WIDTH,
    content: `  ${seccion}`,
    options: { fontSize: 12, textVerticalOffSet: 5, align: 'left' },
  })
}

function drawTableHeaders(pdf: PDFKit.PDFDocument, semestre: 1 | 2) {
  let WIDTH_ACC = 0

  //headers;
  pensionesTableHeaders[semestre == 1 ? 'primerSemestre' : 'segundoSemestre'].forEach((record, index) => {
    drawCell(pdf, {
      begin: { x: TABLE_BEGIN.x + WIDTH_ACC, y: TABLE_BEGIN.y },
      width: record.width,
      content: record.label,
      height: HEADER_CELL_HEIGHT,
      options: { align: 'center', fillColor: '#DADADA', textVerticalOffSet: record.textVerticalOffSet, fontSize: record.fontSize },
    })

    if (index > 0) {
      drawCell(pdf, {
        begin: { x: TABLE_BEGIN.x + WIDTH_ACC, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT / 2 },
        width: record.width / 2,
        content: 'MONTO',
        height: HEADER_CELL_HEIGHT / 2,
        options: { align: 'center', fillColor: '#DADADA', textVerticalOffSet: record.textVerticalOffSet, fontSize: record.fontSize },
      })
      drawCell(pdf, {
        begin: { x: TABLE_BEGIN.x + record.width / 2 + WIDTH_ACC, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT / 2 },
        width: record.width / 2,
        content: 'FECHA',
        height: HEADER_CELL_HEIGHT / 2,
        options: { align: 'center', fillColor: '#DADADA', textVerticalOffSet: record.textVerticalOffSet, fontSize: record.fontSize },
      })
    }
    WIDTH_ACC += record.width
  })
}

function drawTableBodyData(pdf: PDFKit.PDFDocument, { list, semestre }: { list: { nombreCompleto: string; pensiones: PensionRecord[] }[]; semestre: 1 | 2 }) {
  list.forEach((pensionListRow, index) => {
    let widthCounter = 0
    pensionesTableHeaders[semestre == 1 ? 'primerSemestre' : 'segundoSemestre'].forEach((header, i) => {
      if (i === 0) {
        drawCell(pdf, {
          begin: { x: TABLE_BEGIN.x + widthCounter, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
          width: header.width,
          content: `  [${index + 1}] ${pensionListRow.nombreCompleto.substring(0, pensionListRow.nombreCompleto.lastIndexOf(' '))}`,
          height: BODY_CELL_HEIGHT,
          options: { align: 'left', fillColor: '#EAEAEA', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 8 },
        })
      } else {
        const month = header.label.toLowerCase() as Month
        const numberMonth = parseMonthNameToMonthNumber1to12(month) - 1
        const pensionRecordFound = pensionListRow.pensiones.find((pension) => pension.mes === numberMonth)
        let monto: string = ''
        let fecha: string = ''
        let pagadoCompletamente = false
        let montoPagado = 0
        if (pensionRecordFound) {
          montoPagado = pensionRecordFound.monto_pagado
          monto = montoPagado > 0 ? `${montoPagado}/${pensionRecordFound.monto_pagar}` : ''
          fecha = pensionRecordFound.fecha ? new Date(pensionRecordFound.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''
          pagadoCompletamente = pensionRecordFound.pagado
        } else if (!pensionRecordFound) {
          monto = 'XXXXX'
          fecha = 'XXXXX'
        }

        drawCell(pdf, {
          begin: { x: TABLE_BEGIN.x + widthCounter, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
          width: header.width / 2,
          content: monto,
          height: BODY_CELL_HEIGHT,
          options: { align: 'center', fillColor: !pagadoCompletamente && montoPagado > 0 ? '#ff7a83' : '#FFF', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 9 },
        })
        drawCell(pdf, {
          begin: { x: TABLE_BEGIN.x + widthCounter + header.width / 2, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
          width: header.width / 2,
          content: fecha,
          height: BODY_CELL_HEIGHT,
          options: { align: 'center', fillColor: !pagadoCompletamente && montoPagado > 0 ? '#ff7a83' : '#FFF', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 9 },
        })
      }
      widthCounter += header.width
    })
  })
}
