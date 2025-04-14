import { errorResponseHandler } from '../error/errors'
import Pension from '../models/pension'
import { extractNivelYearFromHeaders } from '../utils/global'
import { Request, Response } from 'express'
import { responseOk } from '../utils/responses'
import { ObjectId } from 'mongodb'
import PDFDocument from 'pdfkit'
import { generatePensionTablePdf } from '../utils/pensionTablePdf'
import { drawCell } from '../utils/drawCellTable'
import { NOMBRE_COLEGIO } from '../utils/generarBoletaNotas/utils/vars'

export default class PensionController {
  static async generatetPensionesTablePdfByGradoSeccion(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion } = req.body
      const list = await Pension.getListByGradoSeccion({ nivel, year, grado, seccion })
      //parse the data:
      const data = await list.map((record) => ({ alumno: record.estudiante.nombreCompleto, pensiones: record.pensiones }))
      const document = new PDFDocument({ autoFirstPage: false, layout: 'landscape' })
      document.pipe(res)
      document.addPage()
      const BEGIN = { x: 20, y: 20 }
      const CELL_HEIGHT = 20
      const CELL_WIDTH = 100
      const CELL_WIDTH_DATA = 180
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
      generatePensionTablePdf(document, data, 'primerSemestre')
      document.addPage()
      generatePensionTablePdf(document, data, 'segundoSemestre')
      document.end()
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async getRecordPensionesPagadasByDateRange(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { initDate, endDate } = req.body

      const response = await Pension.getRecordPensionesPagadasByDateRange({ nivel, year, initDate, endDate })
      res.send(responseOk(response))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async getListAlumnosByNumPensionesAtrasadas(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { numeroPensionesAtrasadas, currentMonth } = req.body
      //const delta = 10 - pensiones.length
      //numPensionesPagadas = currentMonth - 1 - numeroPensionesAtrasadas- delta
      const response = await Pension.getListAlumnosByNumPensionesAtrasadas({ nivel, year, numeroPensionesAtrasadas, currentMonth })
      res.send(responseOk(response))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async getPensionesGlobalReport(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { currentMonth } = req.body

      const consolidado = Array.from({ length: currentMonth }, (_, i) => {
        //caso de marzo: length = 2 -> 0 y 1;
        return { numeroPensionesAtrasadas: i, totalAlumnos: 0 }
      })
      const list = await Pension.getPensionesGlobalReport({ nivel, year })

      list.forEach((record) => {
        const delta = 10 - record.pensiones.length
        //para los alumnos que han pagado pensiones por adelantado el resultado de la sgte operacion es negativo, manejar ese caso:
        let numeroPensionesAtrasadas = currentMonth - 1 - record.numPensionesPagadas - delta
        numeroPensionesAtrasadas = numeroPensionesAtrasadas >= 0 ? numeroPensionesAtrasadas : 0

        consolidado[numeroPensionesAtrasadas].totalAlumnos = consolidado[numeroPensionesAtrasadas].totalAlumnos + 1
      })

      res.send(responseOk(consolidado))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async getListGradoSeccion(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, estadosMatricula } = req.body
      const pensiones = await Pension.getListByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula })
      res.send(responseOk(pensiones))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async pagarPensionByAlumnoIdAndMonth(req: Request, res: Response) {
    //monto abonado: es lo que el cliente a abonado en esta operacion
    //monto_pagado: es lo que el cliente ya había pagado anteriormente
    //monto_pagar: el total q tiene q pagar el cliente
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, fecha, mes, monto_pagado, monto_pagar, monto_abonado, issuer } = req.body

      //validación
      const saldoPagar = monto_pagar - monto_pagado

      if (monto_abonado > saldoPagar || (monto_abonado === 0 && monto_pagar > 0)) {
        throw new Error('Monto abonado inválido')
      }
      const reciboId: ObjectId | null = await Pension.pagarPensionByAlumnoIdAndMonth({ issuer, nivel, year, alumnoId, fecha, mes, monto_abonado, monto_pagar, monto_pagado })
      res.send(responseOk({ reciboId: reciboId ? reciboId : '' }))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async updateMontoPagarPension(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { pensiones, alumnoId } = req.body
      await Pension.updateMontoPagarPension({ nivel, year, pensiones, alumnoId })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
