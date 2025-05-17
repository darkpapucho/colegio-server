import { compare } from 'bcrypt'
import { ErrorMessages } from '../error/enums'
import { errorResponseHandler } from '../error/errors'
import Empleado from '../models/empleado'
import { User } from '../models/user'
import { assert, extractNivelYearFromHeaders } from '../utils/global'
import { responseError, responseOk } from '../utils/responses'
import { assertIsProfesorData } from '../utils/validators'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { Grado, Seccion } from '../types/enums'
export default class EmpleadoControllers {
  static async findTutorByGradoSeccion(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion }: { grado: Grado; seccion: Seccion } = req.body
      const response = await Empleado.findTutorByGradoSeccion({ nivel, year, grado, seccion })
      res.send(responseOk(response))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async deleteAnuncioProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { anuncioId, profesorId } = req.body
      await Empleado.deleteAnuncioProfesor({ nivel, year, profesorId, anuncioId })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async agregarAnuncioProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { date, title, content, profesorId, salones } = req.body
      const anuncioId = await Empleado.agregarAnuncioProfesor({ nivel, year, date, title, content, profesorId, salones })

      return res.send(responseOk(anuncioId))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async eliminarHorarioCell(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { startTime, endTime, curso, salon, profesorId } = req.body
      const response = await Empleado.deleteHorarioCell({ nivel, year, startTime, endTime, curso, salon, profesorId })

      if (response.modifiedCount == 0) {
        return res.send(responseError('no se pudo elininar del horario'))
      }
      return res.send(responseOk(false))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async agregarHorarioCell(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { startTime, endTime, profesorId, curso, salon } = req.body
      await Empleado.agregarHorarioCell({ startTime, endTime, profesorId, curso, salon, nivel, year })
      const response = await Empleado.fetchProfesorHorario({ nivel, year, profesorId })

      res.send(responseOk(response?.horario ? response?.horario : []))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async deleteProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { userId } = req.body
      await Empleado.deleteProfesor({ nivel, year, userId })
      await User.deleteUser({ userId, nivel })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async changeProfesorPassword(req: Request, res: Response) {
    try {
      const { nivel } = extractNivelYearFromHeaders(req)
      const { userId, newPassword, currentPassword } = req.body

      //confirmPassword
      const userInfo = await User.getById({ nivel, _id: new ObjectId(userId) })

      assert(userInfo, ErrorMessages.INVALID_CREDENTIALS)
      const result = await compare(currentPassword, userInfo.password)
      if (!result) return res.send(responseError(ErrorMessages.INCORRECT_PASSWORD))
      const response = await Empleado.updateProfesorPassword({ userId, newPassword, nivel })
      if (!response.acknowledged || !response.modifiedCount) {
        return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      }
      return res.send(responseOk(null))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async updateProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const profesor = req.body.profesor
      //TODO: assertProfesor

      await Empleado.updateProfesor({ nivel, year, profesor })

      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async fetchProfesores(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const profesores = await Empleado.fetchProfesores({ nivel, year })
      res.send(responseOk(profesores))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async crearProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { issuer, ...profesorData } = req.body //assert data:ProfesorData

      //CHECK THAT NO USER EXIST WITH USERNAME = PROFESOR.DNI
      const user = await User.getByUsername({ collectionName: `users${nivel}`, username: '' + profesorData.dni })
      if (user !== null) throw new Error(ErrorMessages.USER_ALREADY_EXISTS)
      //create new user for the profesor
      const session = mongoClient.startSession()
      session.startTransaction()
      const response = await User.crearNuevoUsuarioProfesor({ nivel, dni: '' + profesorData.dni, session })
      if (!response.insertedId) {
        await session.abortTransaction()
        session.endSession()
        throw new Error('Error creando nuevo profesor')
      }
      const newProfesor = { ...profesorData, userId: response.insertedId.toString(), rol: 'profesor' }
      assertIsProfesorData(profesorData)
      //agregamos el campo anuncios a la hora de crear al profesor
      newProfesor['anuncios'] = []
      newProfesor['horario'] = []
      const response2 = await Empleado.crearProfesor({ nivel, year, newProfesor, session })
      if (!response2.insertedId) {
        await session.abortTransaction()
        session.endSession()
        throw new Error('Error creando nuevo profesor')
      }
      await session.commitTransaction()
      session.endSession()
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
