import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import { extractNivelYearFromHeaders } from '../utils/global'
import Calendario from '../models/Calendario'
import { responseError, responseOk } from '../utils/responses'
import { ErrorMessages } from '../error/enums'
import { MONTHS_YEAR } from '../utils/calendario'
import { Month } from '../types/asistencia'
export default class CalendarioControllers {
  static async fetchDayId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const day = new Date().getDate()
      const month = MONTHS_YEAR[new Date().getMonth()] as Month
      console.log({ day, month })
      const response = await Calendario.fetchDayId({ day, month, nivel, year })
      console.log({ response })
      res.status(200).send(responseOk(response))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async reportTardanzaAlumno(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, dayId, month, issuer } = req.body
      const response = await Calendario.reportTardanzaAlumno({ nivel, year, alumnoId, dayId, issuer, month })
      console.log({ response })
      if (!response.acknowledged || !response.modifiedCount) {
        return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      }
      return res.send(responseOk(null))
    } catch (error) {
      return errorResponseHandler(res, error)
    }
  }
  static async deleteDayFromCalendar(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { dayId, month } = req.body
      const response = await Calendario.deleteDayFromCalendar({ nivel, year, dayId, month })
      console.log({ nivel, year, dayId, response })
      if (!response.acknowledged || !response.deletedCount) {
        return res.status(503).send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      }
      return res.status(200).send(responseOk(null))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async enableCalendarDays(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { daysList } = req.body
      await Calendario.enableCalendarDays({ nivel, year, daysList })
      res.status(201).send(responseOk(null))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }
  static async fetchCalendario(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const days = await Calendario.fetchCalendario({ nivel, year })
      res.status(200).send(responseOk(days))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }
}
