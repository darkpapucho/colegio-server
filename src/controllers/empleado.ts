import { ErrorMessages } from '../error/enums'
import { errorResponseHandler } from '../error/errors'
import Empleado from '../models/empleado'
import { User } from '../models/user'
import { extractNivelYearFromHeaders } from '../utils/global'
import { responseOk } from '../utils/responses'
import { assertIsProfesorData } from '../utils/validators'
import { Request, Response } from 'express'
export default class EmpleadoControllers {
  static async updateProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const profesor = req.body.profesor
      //TODO: assertProfesor
      const response = await Empleado.updateProfesor({ nivel, year, profesor })
      console.log({ response })
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
      const data = req.body //assert data:ProfesorData
      console.log(data)
      assertIsProfesorData(data)
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
