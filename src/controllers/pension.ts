import { errorResponseHandler } from '../error/errors'
import Pension from '../models/pension'
import { extractNivelYearFromHeaders } from '../utils/global'
import { Request, Response } from 'express'
import { responseOk } from '../utils/responses'
import { ObjectId } from 'mongodb'
import PDFDocument from 'pdfkit'
import { generatePensionTablePdf } from '../utils/pensionTablePdf'
import { Grado, Seccion } from '../types/enums'
import { PensionRecord } from '../types/pensiones'
import { Salon } from '../types/salones'

export default class PensionController {
  static async getLastUpdateDate(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const response = await Pension.getLastUpdateDate({ nivel, year })
      if (!response?.date) {
        throw new Error('Unable to find a last update date')
      }
      res.send(responseOk(response.date))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async setLastUpdateDate(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { date } = req.body
      await Pension.setLastUpdateDate({ date, nivel, year })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async generatetPensionesTablePdfByGradoSeccion(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, allGrades } = req.body

      const document = new PDFDocument({ autoFirstPage: false, layout: 'landscape', margin: 10 })
      document.pipe(res)
      if (allGrades) {
        const list = await Pension.getListByNivel({ nivel, year })

        //parse data:
        const dataList = new Map<Salon, { nombreCompleto: String; grado: Grado; seccion: Seccion; pensiones: PensionRecord[] }[]>()
        list.forEach((record) => {
          const salon = (record.grado + ' ' + record.seccion) as Salon
          if (dataList.has(salon)) {
            dataList.get(salon)!.push(record)
          } else {
            dataList.set(salon, [record])
          }
        })
        const dataArray = Array.from(dataList)
        dataArray.forEach((record) => {
          const salon = record[0]
          const GRADO = salon.substring(0, salon.lastIndexOf(' ')) as Grado
          const SECCION = salon.substring(salon.lastIndexOf(' ')) as Seccion
          const data = (record[1] as unknown as { nombreCompleto: string; pensiones: PensionRecord[] }[]).sort((prev, curr) => (prev.nombreCompleto > curr.nombreCompleto ? 1 : -1))

          document.addPage()
          generatePensionTablePdf(document, data, { nivel, grado: GRADO, seccion: SECCION, semestre: 1 })
          document.addPage()
          generatePensionTablePdf(document, data, { nivel, grado: GRADO, seccion: SECCION, semestre: 2 })
        })
      } else {
        const list = await Pension.getListByGradoSeccion({ nivel, year, grado, seccion })
        //parse the data:
        const data = list
          .map((record) => ({ nombreCompleto: record.estudiante.nombreCompleto, pensiones: record.pensiones }))
          .sort((prev, curr) => (prev.nombreCompleto > curr.nombreCompleto ? 1 : -1))
        //write PDF
        document.addPage()
        generatePensionTablePdf(document, data, { nivel, grado, seccion, semestre: 1 })
        document.addPage()
        generatePensionTablePdf(document, data, { nivel, grado, seccion, semestre: 2 })
      }

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
