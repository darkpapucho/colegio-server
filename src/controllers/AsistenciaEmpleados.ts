import { Request, Response } from 'express'
import { extractNivelYearFromHeaders } from '../utils/global'
import { responseOk } from '../utils/responses'
import { errorResponseHandler } from '../error/errors'
import AsistenciaEmpleados from '../models/AsistenciaEmpleados'
import { getAsistenciaMessage } from '../utils/asistencia'

export default class AsistenciaEmpleadosController {
  static async enrollFingerPrintToEmpleado(req: Request, res: Response) {
    try {
      const { year, nivel } = extractNivelYearFromHeaders(req)
      const { empleadoInfo, fingerprintId, enrollDate } = req.body
      empleadoInfo.nivel = nivel
      empleadoInfo.enrollDate = enrollDate
      const response = await AsistenciaEmpleados.enrollNewFingerprintId({ empleadoInfo, year, fingerprintId })

      res.status(200).send(responseOk(response.upsertedId))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async getEmpleadoInfoByFingerprintId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { id } = req.query

      const empleadoInfo = await AsistenciaEmpleados.getEmpleadoInfoByFingerprintId({ year, fingerprintId: id as unknown as number })
      console.log({ nivel, year })
      console.log({ empleadoInfo })
      res.status(200).send(responseOk(empleadoInfo))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async marcarAsistencia(req: Request, res: Response) {
    try {
      const { year } = extractNivelYearFromHeaders(req)
      const { month, day, time, fingerprintId } = req.body
      const empleadoInfo = await AsistenciaEmpleados.getEmpleadoInfoByFingerprintId({ year, fingerprintId })
      if (!empleadoInfo) throw new Error('empleado no registrado')
      const empleadoId = empleadoInfo.empleadoId.toString()
      const isAlreadyFilled = await AsistenciaEmpleados.checkAsistenciaRecord({ year, month, day, empleadoId })
      if (isAlreadyFilled) {
        throw new Error('la asistencia ya está marcada')
      }
      const response = await AsistenciaEmpleados.marcarAsistenciaEmpleados({ month, day, time, empleadoId, year })
      if (!response.modifiedCount) throw new Error('no se pudo marcar la asistencia')
      res.status(200).send(responseOk(getAsistenciaMessage(time)))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
