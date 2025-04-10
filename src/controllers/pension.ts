import { errorResponseHandler } from '../error/errors'
import Pension from '../models/pension'
import { extractNivelYearFromHeaders } from '../utils/global'
import { Request, Response } from 'express'
import { responseOk } from '../utils/responses'
import { ObjectId } from 'mongodb'
export default class PensionController {
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
