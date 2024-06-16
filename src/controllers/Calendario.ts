import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import { extractNivelYearFromHeaders } from '../utils/global'
import Calendario from '../models/Calendario'
import { responseError, responseOk } from '../utils/responses'
import { ErrorMessages } from '../error/enums'
import { MONTHS_YEAR } from '../utils/calendario'
import { Month } from '../types/asistencia'
import convertDateToPeriodo from '../utils/convertDateToPeriodo'
import { Alumno } from '../models/alumno'
export default class CalendarioControllers {
  static async getRecordAsistenciasPeriodo(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, periodo } = req.body
      const alumnosIds = await Alumno.fetchAlumnosIdsByGradoSeccion({ nivel, year, grado, seccion })
      const asistencias = await Calendario.getAsistenciaRecordPeriodo({ nivel, year, periodo, alumnosIds })

      res.send(responseOk(asistencias))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async setCurrentPeriodo(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const periodo = req.body.periodo
      await Calendario.setCurrentPeriodo({ nivel, year, periodo })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async fetchConvertDateToPeriodo(_req: Request, res: Response) {
    try {
      console.log('Converting date to periodo')
      const periodo = convertDateToPeriodo(new Date())
      return res.send(responseOk(periodo))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async fetchCurrentPeriodo(req: Request, res: Response) {
    try {
      console.log('Fetching current Periodo')
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const response = await Calendario.fetchCurrentPeriodo({ nivel, year })
      if (!response) {
        return res.send(responseError(ErrorMessages.PERIODO_NOT_SET))
      }
      return res.send(responseOk(response.periodo))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }

  static async fetchDayId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const day = new Date().getDate()
      const month = MONTHS_YEAR[new Date().getMonth()] as Month

      const response = await Calendario.fetchDayId({ day, month, nivel, year })

      res.status(200).send(responseOk(response))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async reportTardanzaAlumno(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, dayId, issuer } = req.body
      //el status enabled no es imprecindible aqui
      //revisar que no se haya reportado una tardanza con aterioridad
      const results = await Calendario.fetchADayAsistenciaRecord({ nivel, year, alumnoId, dayId })

      if (results.length === 0) return res.send(responseError(ErrorMessages.INVALID_REQUEST))
      const oldAsistenciaValue = results[0].records.asistencia
      if (oldAsistenciaValue === 'T') return res.send(responseError(ErrorMessages.TARDANZA_ALREADY_REPORTED))
      //verificar q no se haya pasado asistencia
      if (oldAsistenciaValue === 'A' || oldAsistenciaValue === 'F') return res.send(responseError(ErrorMessages.ASISTENCIA_ALREADY_REPORTED))
      //reportar la tardanza
      await Calendario.reportTardanzaAlumno({ nivel, year, alumnoId, dayId, issuer })
      return res.send(responseOk(null))
    } catch (error) {
      return errorResponseHandler(res, error)
    }
  }
  static async deleteDayFromCalendar(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { dayId } = req.body
      const response = await Calendario.deleteDayFromCalendar({ nivel, year, dayId })

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
