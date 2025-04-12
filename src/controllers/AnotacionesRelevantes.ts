import { Request, Response } from 'express'
import { extractNivelYearFromHeaders } from '../utils/global'
import { errorResponseHandler } from '../error/errors'
import AnotacionesRelevantes from '../models/AnotacionesRelevantes'
import { responseOk } from '../utils/responses'

export default class AnotacionesRelevantesController {
  static async editarAnotacionByAlumnoId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { detalle, fecha, alumnoId, issuer } = req.body

      await AnotacionesRelevantes.editarAnotacionByAlumnoId({ nivel, year, detalle, fecha, alumnoId, issuer })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
