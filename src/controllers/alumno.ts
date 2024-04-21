import { NextFunction, Request, Response } from 'express'
import { assertGrado, assertSeccion, extractNivelYearFromHeaders } from '../utils/global'
import { Alumno } from '../models/alumno'
import { responseError, responseOk } from '../utils/responses'
import { errorResponseHandler } from '../error/errors'
import { ErrorMessages } from '../error/enums'
import { assertIsAMatriculado, assertIsNuevoAlumno } from '../utils/validators'
import { GradosInicial, VALID_GRADOS } from '../types/enums'
import { AMatriculado, PartialAlumno } from '../types/alumno'
import { ObjectId } from 'mongodb'
import Calendario from '../models/Calendario'

export class AlumnoControllers {
  static async fetchAsistenciaList(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, month, day } = req.body
      assertGrado(grado)
      assertSeccion(seccion)
      const response = await Calendario.checkSalonDayStatusByMonthDay({ nivel, year, month, day })
      if (!response) throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
      if (response.status === 'disabled') {
        return res.status(409).send(responseError('La asistencia no se encuentra disponible en este momento'))
      }
      const alumnosList = await Alumno.fetchAsistenciaList({ grado, seccion, nivel, year, month, dayId: response._id.toString() })
      return res.status(200).send(responseOk(alumnosList))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }

  static async updateAsistenciaList(req: Request, res: Response) {
    try {
      console.log('hihih')
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { asistenciaList } = req.body
      //check enabled status from calendario dayId
      const response = await Calendario.checkSalonDayStatus({ nivel, year, dayId: asistenciaList.dayId })
      console.log({ response })
      if (!response) throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
      if (response.status === 'disabled') {
        return res.status(409).send(responseError('El tiempo de asistencia a pasado.'))
      }
      await Alumno.updateAsistenciaList({ nivel, year, asistenciaList })
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
      const matriculadosCollection = `matriculados${nivel}${year}`
      const result = await Alumno.nuevaMatricula({ alumno, collectionName: matriculadosCollection })
      if (!result) {
        throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
      }
      res.status(202).send(responseOk(null)) // 202=acepted
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }
}
