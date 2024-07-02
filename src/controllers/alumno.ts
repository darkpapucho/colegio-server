import { NextFunction, Request, Response } from 'express'
import { assertGrado, assertSeccion, extractNivelYearFromHeaders } from '../utils/global'
import { Alumno } from '../models/alumno'
import { responseError, responseOk } from '../utils/responses'
import { errorResponseHandler } from '../error/errors'
import { ErrorMessages } from '../error/enums'
import { assertIsAMatriculado, assertIsNuevoAlumno } from '../utils/validators'
import { GradosInicial, VALID_GRADOS } from '../types/enums'
import { AMatriculado, AsistenciaRecord, AsistenciaValue, PartialAlumno } from '../types/alumno'
import { ObjectId } from 'mongodb'
import Calendario from '../models/Calendario'
import convertDateToPeriodo from '../utils/convertDateToPeriodo'

export class AlumnoControllers {
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

        if (record.asistencia === 'F') {
          //cheeck q no se haga por segunda vez
          if (oldAsistenciaValue === '' || oldAsistenciaValue === 'A') {
            //incrementamos la falta injustificada
            await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: 1 })
            //pasamos la nueva asistencia
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          }
          //si el valor anterior ya era F o T no se hace nada
        } else if (record.asistencia === 'A') {
          if (oldAsistenciaValue === 'F') {
            //DECREMENTAMOS las inasistencias injustificadas
            await Alumno.increaseInasistenciaInjustificadaAlumno({ nivel, year, alumnoId: record.alumnoId, periodo, quantity: -1 })
            //pasamos la nueva asistencia
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          } else if (oldAsistenciaValue === '') {
            //pasamos la nueva asistencia
            await Calendario.setAsistenciaAlumnoDay({ nivel, year, dayId, alumnoId: record.alumnoId, asistencia: record.asistencia })
          }
          //en caso de T o A no es necesario hacer nada
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
      res.status(200).send(responseOk(alumnos))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async ratificarMatricula(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req) // asserted
      const currentYear = new Date().getFullYear()
      const { grado } = req.query
      assertGrado(grado)

      if (currentYear - Number(year) !== 1) {
        throw new Error(ErrorMessages.RATIFICACION_MATRICULA_INVALID_AÑO)
      }
      if (grado === 'SEXTO') {
        throw new Error(ErrorMessages.RATIFICACION_MATRICULA_INVALID_GRADO)
      }

      let currentYearCollectionName: string = ''
      let lastYearCollectionName: string = ''
      if (grado === GradosInicial.Grupo5años) {
        currentYearCollectionName = `matriculadosprimaria${currentYear}`
        lastYearCollectionName = `ratificarinicial${year}`
      } else {
        currentYearCollectionName = `matriculados${nivel}${currentYear}`
        lastYearCollectionName = `ratificar${nivel}${year}`
      }
      const { alumnos } = req.body
      //assert alumnos data
      const alumnosParsed = alumnos.map((alumno: AMatriculado) => {
        assertIsAMatriculado(alumno)
        const currentGradoIndex = VALID_GRADOS.indexOf(alumno.grado)
        alumno.grado = VALID_GRADOS[currentGradoIndex + 1]
        return alumno
      })
      await Alumno.ratificarMatricula({ alumnos: alumnosParsed, currentYearCollectionName, lastYearCollectionName })
      res.status(201).send(responseOk(null))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async fetchMatriculados(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion } = req.query
      assertGrado(grado)
      assertSeccion(seccion)
      const matriculadosCollection = `matriculados${nivel}${year}`
      const matriculados = await Alumno.getByGradoSeccion({ grado, seccion, collectionName: matriculadosCollection })
      res.status(200).send(responseOk(matriculados))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async nuevaMatricula(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumno } = req.body
      assertIsNuevoAlumno(alumno)
      alumno.apellidos = alumno.apellidos.toUpperCase()
      alumno.nombres = alumno.nombres.toUpperCase()
      //verificar q no exista un alumno ya matriculado con el mismo dni
      const foundAlumno = await Alumno.fetchAlumnoByDni({ nivel, year, dni: alumno.dni + '' })
      if (foundAlumno) {
        return res.send(responseError('Ya existe un alumno matriculado con este DNI'))
      }
      //TODO: CREATE SESSION MONGO
      //matricular nuevo alumno
      const result = await Alumno.nuevaMatricula({ alumno, nivel, year })
      if (!result.acknowledged) {
        return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      }
      const lastDayFromCalendar = await Calendario.fetchLasyDayOfCalendarioEscolar({ nivel, year })
      const lastDate = new Date(`${lastDayFromCalendar.month}-${lastDayFromCalendar.day}-${year}`)
      //insertar asistencia records de acuerdo a la fecha de la mtricula
      const calendarioDaysForMatricula = await Calendario.getCalendarioDaysForNewMatricula({ nivel, year, fechaMatricula: new Date(alumno.fechaMatricula), lastDate })
      //insertar nuevo record en asistencias{nivel}{year}
      const alumnoAsistenciaRecords: AsistenciaRecord[] = calendarioDaysForMatricula.map((element) => {
        return { dayId: element._id, day: element.day, month: element.month, asistencia: '', modified: '' }
      })
      const result2 = await Calendario.insertNewMatriculaRecordAsistenciaEscolar({ nivel, year, alumnoId: result.insertedId, records: alumnoAsistenciaRecords })
      if (!result2.acknowledged) {
        return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      }
      return res.status(202).send(responseOk(null)) // 202=acepted
    } catch (error) {
      return errorResponseHandler(res, error)
    }
  }
}
