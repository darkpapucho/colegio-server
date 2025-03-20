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
import { AsistenciaValue } from '../types/alumno'

export default class CalendarioControllers {
  //end point for admin
  static async updateAsistenciaListByGradoSeccionDayId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { asistenciaList } = req.body
      const list = asistenciaList.list as { alumnoId: string; asistencia: AsistenciaValue }[]
      const periodo = convertDateToPeriodo(new Date())
      const dayId = asistenciaList.dayId as string
      //check enabled status from calendario dayId

      //for each element in the list
      list.forEach(async (record) => {
        //procesamos F, A, T y ""
        //CHECK the current asistencia status
        const asistenciaResults = await Calendario.fetchADayAsistenciaRecord({ nivel, year, alumnoId: record.alumnoId, dayId })
        if (!asistenciaResults.length) throw new Error(ErrorMessages.INVALID_REQUEST)
        const oldAsistenciaValue = asistenciaResults[0].records.asistencia
        const justificado = asistenciaResults[0].records.justificado ? true : false
        if (record.asistencia === 'F') {
          //cheeck q no se haga por segunda vez
          if (oldAsistenciaValue === '' || oldAsistenciaValue === 'A') {
            //incrementamos la falta injustificada
            await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 })
            //pasamos la nueva asistencia
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          } else if (oldAsistenciaValue == 'T') {
            await Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 })
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, alumnoId: record.alumnoId, dayId, asistencia: record.asistencia })
          }
        } else if (record.asistencia === 'A' || '') {
          if (oldAsistenciaValue === 'F') {
            //DECREMENTAMOS las inasistencias injustificadas
            if (justificado) {
              await Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            } else {
              await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            }
          } else if (oldAsistenciaValue == 'T') {
            await Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
          }
          await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
        } else if (record.asistencia == 'T') {
          if (oldAsistenciaValue == 'A' || oldAsistenciaValue == '') {
          } else if (oldAsistenciaValue == 'F') {
            if (justificado) {
              await Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            } else {
              await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, periodo, alumnoId: record.alumnoId, quantity: -1 })
            }
          }
          await Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 })
          await Calendario.setAsistenciaAlumnoDay({ nivel, year, alumnoId: record.alumnoId, dayId, asistencia: record.asistencia })
        }
      })
      //old Code:await Alumno.updateAsistenciaList({ nivel, year, asistenciaList })

      return res.status(200).send(responseOk(null))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }

  static async fetchTardanzaListByDayId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { dayId } = req.body
      const tardanzalist = await Calendario.fetchAsistenciaListByDayIdAndValue({ nivel, year, dayId, asistenciaValue: 'T' })

      res.send(responseOk(tardanzalist))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async fetchAsistenciaListByGradoSeccionDayId(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, month, dayId, estadosMatricula } = req.body

      const asistenciaList = await Calendario.fetchAsistenciaListByGradoSeccionDayId({ nivel, year, grado, seccion, dayId, estadosMatricula })

      res.send(responseOk({ asistenciaList, dayId, month }))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async justificarFalta(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, dayId, date } = req.body
      //check que no se haya justificado anteriormente la falta
      const result = await Calendario.getAsistenciaDayStatus({ nivel, year, alumnoId, dayId })
      if (result.record.justificado) return res.send(responseError('esta falta ya fue justificada con anterioridad'))
      const periodo = convertDateToPeriodo(new Date(date))
      await Calendario.justificarFalta({ nivel, year, periodo, alumnoId, dayId })
      return res.send(responseOk(null))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }

  static async getRecordAsistenciasPeriodo(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, periodo, estadosMatricula } = req.body

      const alumnosIds = await Alumno.fetchAlumnosIdsByGradoSeccion({ nivel, year, grado, seccion, estadoMatricula: estadosMatricula })

      const asistencias = await Calendario.getAsistenciaRecordPeriodo({ nivel, year, periodo, alumnosIds })

      const availableDays = await Calendario.getAvailableDaysFromCalendarioByPeriodo({ nivel, year, periodo })

      res.send(responseOk({ asistencias, availableDays }))
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
      const periodo = convertDateToPeriodo(new Date())
      return res.send(responseOk(periodo))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async fetchCurrentPeriodo(req: Request, res: Response) {
    try {
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
      const { day } = req.body
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
      //si no se encontró ningun record, entonces error
      if (results.length === 0) return res.send(responseError(ErrorMessages.INVALID_REQUEST))

      const oldAsistenciaValue = results[0].records.asistencia
      if (oldAsistenciaValue === 'T') return res.send(responseError(ErrorMessages.TARDANZA_ALREADY_REPORTED))
      //verificar q no se haya pasado asistencia ya
      //if (oldAsistenciaValue === 'A' || oldAsistenciaValue === 'F') return res.send(responseError(ErrorMessages.ASISTENCIA_ALREADY_REPORTED))
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
