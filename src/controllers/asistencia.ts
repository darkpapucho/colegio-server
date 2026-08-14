import { Request, Response } from 'express'
import Asistencia from '../models/Asistencia'
import { responseError, responseOk } from '../utils/responses'
import { errorResponseHandler } from '../error/errors'

export default class AsistenciaController {
  static async marcarAsistencia(req: Request, res: Response) {
    try {
      const { dayId, timestamp, userId } = req.body
      const response = await Asistencia.marcarAsistencia({ userId, dayId, timestamp })
      if (response.acknowledged && response.modifiedCount == 1) {
        res.send(responseOk(null))
        return
      }
      return res.send(responseError('no se pudo marcar la asistencia'))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
}
