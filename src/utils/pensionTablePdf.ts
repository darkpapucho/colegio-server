import { Month } from '../types/asistencia'
import { PensionRecord } from '../types/pensiones'
import { parseMonthNameToMonthNumber1to12 } from '../vars/periodosDates'
import { drawCell } from './drawCellTable'

// import { PensionRecord } from '../types/pensiones'
const HEADER_CELL_HEIGHT = 34
const BODY_CELL_HEIGHT = 20
const TABLE_BEGIN = { x: 20, y: 70 }
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
    alumno: string
    pensiones: PensionRecord[]
  }[],
  semestre: 'primerSemestre' | 'segundoSemestre',
) {
  let WIDTH_ACC = 0

  //headers;
  pensionesTableHeaders[semestre].forEach((record, index) => {
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
  //body:
  WIDTH_ACC = 0
  list.forEach((pensionListRow, index) => {
    let widthCounter = 0
    pensionesTableHeaders[semestre].forEach((header, i) => {
      if (i === 0) {
        drawCell(pdf, {
          begin: { x: TABLE_BEGIN.x + widthCounter, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
          width: header.width,
          content: `  [${index + 1}] ${pensionListRow.alumno.substring(0, pensionListRow.alumno.lastIndexOf(' '))}`,
          height: HEADER_CELL_HEIGHT,
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
          height: HEADER_CELL_HEIGHT,
          options: { align: 'center', fillColor: !pagadoCompletamente && montoPagado > 0 ? '#ff7a83' : '#FFF', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 9 },
        })
        drawCell(pdf, {
          begin: { x: TABLE_BEGIN.x + widthCounter + header.width / 2, y: TABLE_BEGIN.y + HEADER_CELL_HEIGHT + BODY_CELL_HEIGHT * index },
          width: header.width / 2,
          content: fecha,
          height: HEADER_CELL_HEIGHT,
          options: { align: 'center', fillColor: !pagadoCompletamente && montoPagado > 0 ? '#ff7a83' : '#FFF', textVerticalOffSet: BODY_CELL_HEIGHT / 2 - 4, fontSize: 9 },
        })
      }
      widthCounter += header.width
    })
  })
}
