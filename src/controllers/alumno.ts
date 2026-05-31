import { NextFunction, Request, Response } from 'express'
import { assertGrado, assertSeccion, extractNivelYearFromHeaders } from '../utils/global'
import { Alumno } from '../models/alumno'
import { responseError, responseOk } from '../utils/responses'
import { errorResponseHandler } from '../error/errors'
import { ErrorMessages } from '../error/enums'
import { assertIsAMatriculado, assertIsNuevoAlumno } from '../utils/validators'
import { EstadoMatricula, Nivel, VALID_GRADOS, Year } from '../types/enums'
import { AMatriculado, AMatriculadoNoId, AsistenciaValue, NuevoAlumno, PartialAlumno } from '../types/alumno'
import { ObjectId, WithId } from 'mongodb'
import Calendario from '../models/Calendario'
import convertDateToPeriodo from '../utils/convertDateToPeriodo'

export class AlumnoControllers {
  static async agregarApoderado(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, apoderado }: { alumnoId: string; apoderado: any } = req.body
      const issuer = req.body.issuer

      apoderado._id = new ObjectId()
      await Alumno.agregarApoderado({ alumnoId, apoderado, nivel, year, issuer })

      res.send(responseOk(null))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }
  static async editarApoderado(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, apoderado }: { alumnoId: string; apoderado: any } = req.body
      const issuer = req.body.issuer as string
      apoderado.issuer = new ObjectId(issuer)
      await Alumno.editarApoderado({ alumnoId, apoderado, nivel, year })
      res.send(responseOk(null))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }
  static async fetchAsistenciaList(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, month, day } = req.body
      assertGrado(grado)
      assertSeccion(seccion)
      //check enabled status
      const response = await Calendario.checkSalonDayStatusByMonthDay({ nivel, year, month, day })

      if (!response) throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
      if (response.status === 'disabled') {
        return res.send(responseError('La asistencia no se encuentra disponible en este momento'))
      }
      const alumnosList = await Alumno.fetchAsistenciaList({ grado, seccion, nivel, year, month, dayId: response._id.toString() })
      return res.status(200).send(responseOk(alumnosList))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  //end point for teachers
  static async updateAsistenciaList(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { asistenciaList } = req.body
      const list = asistenciaList.list as { alumnoId: string; asistencia: AsistenciaValue }[]
      const periodo = convertDateToPeriodo(new Date())

      const dayId = asistenciaList.dayId as string
      //check enabled status from calendario dayId
      const response = await Calendario.checkSalonDayStatus({ nivel, year, dayId: asistenciaList.dayId })

      if (!response) throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)

      if (response.status === 'disabled') {
        return res.send(responseError('La asistencia para este día no se encuentra habilitada.'))
      }

      //for each element in the list
      list.forEach(async (record) => {
        //solo procesamos F y A
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
            //si el valor anterior ya era F o T no se hace nada (cambiado el 24 de marzo del 2025)
          } else if (oldAsistenciaValue === 'T') {
            //disminuimos en 1 la cantidad de tardanzas
            await Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            //incrementamos la falta injustificada
            await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 })
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, alumnoId: record.alumnoId, asistencia: record.asistencia, dayId })
          }
        } else if (record.asistencia === 'A') {
          if (oldAsistenciaValue === 'F') {
            //DECREMENTAMOS las inasistencias injustificadas
            if (justificado) {
              await Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            } else {
              await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            }
            //pasamos la nueva asistencia
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          } else if (oldAsistenciaValue === '') {
            //pasamos la nueva asistencia
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
            //en caso de T o A no es necesario hacer nada(cambiado el 24 de marzo 2025)
          } else if (oldAsistenciaValue === 'T') {
            await Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            //pasamos la nueva asistencia
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          }
        } else if (record.asistencia === 'T') {
          if (oldAsistenciaValue === 'F') {
            //DECREMENTAMOS las inasistencias injustificadas
            if (justificado) {
              await Alumno.increaseInasistenciaJustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            } else {
              await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            }
            //pasamos la nueva asistencia
            await Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 })
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          } else if (oldAsistenciaValue === '' || oldAsistenciaValue == 'A') {
            //pasamos la nueva asistencia
            await Alumno.increaseTardanzaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 })
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          }
        }
      })
      //old Code:await Alumno.updateAsistenciaList({ nivel, year, asistenciaList })

      return res.status(200).send(responseOk(null))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async editarAlumno(req: Request, res: Response, next: NextFunction) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const alumno = req.body.alumno as PartialAlumno
      const collectionName = `matriculados${nivel}${year}`
      const confirmation = await Alumno.editarAlumno({ alumno, collectionName })
      res.send(responseOk(confirmation))
    } catch (err) {
      next(err)
    }
  }
  static async buscarAlumno(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { nombreCompleto, estadosMatricula } = req.body
      //TODO: ASSERT ESTADOSMATRICULA
      const collectionName = `matriculados${nivel}${year}`
      const alumnos = await Alumno.buscarAlumno({ nombreCompleto, collectionName, estadosMatricula })
      res.send(responseOk(alumnos))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async retirarAlumno(req: Request, res: Response) {
    try {
      const { _id, fechaRetiro } = req.body
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const collectionName = `matriculados${nivel}${year}`

      const modifiedCount = await Alumno.retirarAlumno({ _id: new ObjectId(_id), fechaRetiro, collectionName })
      res.send(responseOk({ modifiedCount }))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async fetchRatificarList(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const collectionName = `ratificar${nivel}${year}`
      const { grado, seccion } = req.query
      assertGrado(grado)
      assertSeccion(seccion)
      const alumnos = await Alumno.getRatificarList({ grado, seccion, collectionName })

      res.status(200).send(responseOk(alumnos.sort((prev, curr) => (prev.apellidos > curr.apellidos ? 1 : -1))))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async ratificarMatricula(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req) // asserted
      const currentYear = ('' + new Date().getFullYear()) as Year
      const { grado } = req.query
      assertGrado(grado)
      if (Number(currentYear) - Number(year) !== 1) {
        throw new Error(ErrorMessages.RATIFICACION_MATRICULA_INVALID_AÑO)
      }
      // if (grado === 'SEXTO') {
      //   throw new Error(ErrorMessages.RATIFICACION_MATRICULA_INVALID_GRADO)
      // }
      let targetNivel: Nivel = nivel
      if (nivel === 'inicial' && grado === 'Grupo 5 años') {
        targetNivel = 'primaria'
      } else if (nivel === 'primaria' && grado == 'SEXTO') {
        targetNivel = 'secundaria'
      }
      const { alumnos, fechaMatricula } = req.body
      //assert alumnos data
      const alumnosParsed: AMatriculado[] = alumnos.map((alumno: AMatriculado) => {
        assertIsAMatriculado(alumno)
        const currentGradoIndex = VALID_GRADOS.indexOf(alumno.grado)
        alumno.grado = VALID_GRADOS[currentGradoIndex + 1]
        return alumno
      })
      //filter out alumnos that are already matriculados:
      const filteredAlumnos = alumnosParsed.filter(async (record) => {
        if (record.dni) {
          const response = await Alumno.fetchAlumnoByDni({ nivel: targetNivel, year, dni: record.dni })
          return response === null
        } else {
          const response = await Alumno.fetchAlumnoByCodigoEstudiante({ nivel: targetNivel, year, codigoEstudiante: record.codigoEstudiante })
          return response === null
        }
      })
      //proceso ratificacion matricula
      await Alumno.ratificarMatricula({ alumnos: filteredAlumnos, currentYear, lastYear: year, sourceNivel: nivel, targetNivel, fechaMatricula: new Date(fechaMatricula) })
      res.status(201).send(responseOk(null))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async fetchMatriculados(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, estados } = req.query

      const estadosMatricula = (estados as string)?.split('-') as EstadoMatricula[]

      assertGrado(grado)
      assertSeccion(seccion)

      const matriculados = await Alumno.getByGradoSeccion({ grado, seccion, nivel, year, estadosMatricula })
      res.status(200).send(responseOk(matriculados))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async nuevaMatricula(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumno }: { alumno: NuevoAlumno } = req.body

      assertIsNuevoAlumno(alumno)

      alumno.apellidos = alumno.apellidos.toUpperCase()
      alumno.nombres = alumno.nombres.toUpperCase()
      //verificar q no exista un alumno ya matriculado con el mismo dni
      let foundAlumno: WithId<AMatriculadoNoId> | null = null
      const reason: string[] = []
      if (alumno.dni) {
        foundAlumno = await Alumno.fetchAlumnoByDni({ nivel, year, dni: alumno.dni + '' })
        reason.push('este dni')
      } else if (alumno.codigoEstudiante) {
        foundAlumno = await Alumno.fetchAlumnoByCodigoEstudiante({ nivel, year, codigoEstudiante: alumno.codigoEstudiante })
        reason.push('este código de estudiante')
      } else {
        foundAlumno = await Alumno.fetchAlumnoByGradoSeccionApellidos({ nivel, year, grado: alumno.grado, seccion: alumno.seccion, apellidos: alumno.apellidos })
        reason.push('estos apellidos')
      }

      if (foundAlumno) {
        return res.send(responseError(`Ya existe un alumno matriculado con ${reason[0]}`))
      }
      //TODO: CREATE SESSION MONGO
      //matricular nuevo alumno
      // const result = await Alumno.nuevaMatricula({ alumno, nivel, year })
      // if (!result.acknowledged) {
      //   return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      // }
      // const lastDayFromCalendar = await Calendario.fetchLastDayOfCalendarioEscolar({ nivel, year })
      // const lastDate = new Date(`${lastDayFromCalendar.month}-${lastDayFromCalendar.day}-${year}`)
      // //insertar asistencia records de acuerdo a la fecha de la mtricula
      // const calendarioDaysForMatricula = await Calendario.getCalendarioDaysForNewMatricula({ nivel, year, fechaMatricula: new Date(alumno.fechaMatricula), lastDate })
      // //insertar nuevo record en asistencias{nivel}{year}
      // const alumnoAsistenciaRecords: AsistenciaRecord[] = calendarioDaysForMatricula.map((element) => {
      //   return { dayId: element._id, day: element.day, month: element.month, asistencia: '', modified: '' }
      // })
      // const result2 = await Calendario.insertNewMatriculaRecordAsistenciaEscolar({ nivel, year, alumnoId: result.insertedId, records: alumnoAsistenciaRecords })
      // if (!result2.acknowledged) {
      //   return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      // }
      const result = await Alumno.ProcesoNuevoMatricula({ nivel, year, alumno })
      if (!result) {
        return res.send(responseError('Error durante el proceso de matrícula, intentelo nuevamente'))
      }
      return res.status(202).send(responseOk(null)) // 202=acepted
    } catch (error) {
      return errorResponseHandler(res, error)
    }
  }
}
