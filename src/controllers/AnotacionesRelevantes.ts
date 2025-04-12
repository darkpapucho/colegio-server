import { Request, Response } from 'express'
import { extractNivelYearFromHeaders } from '../utils/global'
import { errorResponseHandler } from '../error/errors'
import AnotacionesRelevantes from '../models/AnotacionesRelevantes'
import { responseError, responseOk } from '../utils/responses'

export default class AnotacionesRelevantesController {
  static async editarAnotacionByAlumnoId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { detalle, fecha, alumnoId, issuer } = req.body

      const response = await AnotacionesRelevantes.editarAnotacionByAlumnoId({ nivel, year, detalle, fecha, alumnoId, issuer })
      if (response.upsertedCount) {
        return res.send(responseOk(null))
      } else {
        return res.send(responseError('no se pudo editar la anotación'))
      }
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async eliminarAnotacionByAlumnoId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId } = req.body
      const response = await AnotacionesRelevantes.eliminarAnotacionRelevanteByAlumnoId({ nivel, year, alumnoId })
      if (response.acknowledged) {
        return res.send(responseOk(null))
      } else {
        return res.send(responseError('no se pudo eliminar la anotación'))
      }
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
}
