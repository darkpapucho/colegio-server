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
export default class EmpleadoControllers {
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
      console.log({ userId, newPassword, currentPassword })
      //confirmPassword
      const userInfo = await User.getById({ nivel, _id: new ObjectId(userId) })
      console.log({ userInfo })
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
      console.log('creando profesores')
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { issuer, ...data } = req.body //assert data:ProfesorData
      console.log({ data, nivel, year })
      assertIsProfesorData(data)
      console.log('passed validation')
      const user = await User.getByUsername({ collectionName: `users${nivel}`, username: '' + data.dni })
      if (user !== null) throw new Error(ErrorMessages.USER_ALREADY_EXISTS)
      const response = await User.crearNuevoUsuarioProfesor({ nivel, dni: data.dni })
      if (!response.insertedId) throw new Error('Error creando nuevo profesor')
      const response2 = await Empleado.crearProfesor({ nivel, year, userId: response.insertedId, data })
      if (!response2.insertedId) throw new Error('Error creando nuevo profesor')

      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
