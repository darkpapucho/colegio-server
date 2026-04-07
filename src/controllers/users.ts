import { Response, Request } from 'express'
import { responseError, responseOk } from '../utils/responses'
import { errorResponseHandler } from '../error/errors'
import { signToken } from '../utils/jwt'
import { User } from '../models/user'
import { assert, extractNivelYearFromHeaders } from '../utils/global'
import { ErrorMessages } from '../error/enums'
import { compare } from 'bcrypt'
import { hashPassword } from '../utils/hashPassword'

export class UserControllers {
  static async resetProfesorPassword(req: Request, res: Response) {
    try {
      const { nivel } = extractNivelYearFromHeaders(req)
      const { dni, userId } = req.body

      const newPassword = await hashPassword('' + dni)
      const response = await User.resetProfesorPassword({ nivel, newPassword, userId })
      if (!response.acknowledged || !response.modifiedCount) {
        return res.send(responseError(ErrorMessages.OPERATION_NOT_COMPLETED))
      }
      return res.send(responseOk(null))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async loginProfesor(req: Request, res: Response) {
    try {
      const { username, password, nivel, year } = req.body
      const usersCollectionName = `users${nivel}`
      const empleadosCollectionName = `empleados${nivel}${year}`

      const userCredentials = await User.getByUsername({ collectionName: usersCollectionName, username })

      assert(userCredentials != null, ErrorMessages.INVALID_CREDENTIALS)
      //validation of the password:
      const isValidPassword = await compare(password, userCredentials.password)
      assert(isValidPassword, ErrorMessages.INVALID_CREDENTIALS)

      //fetch profesor:
      const profesorInfo = await User.getProfesorInfo({ collectionName: empleadosCollectionName, userId: userCredentials._id.toString() })

      assert(profesorInfo != null, ErrorMessages.INVALID_CREDENTIALS)
      const token = signToken({ _id: userCredentials._id.toString() })

      res.status(200).send(responseOk({ profesor: profesorInfo, token }))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async login(req: Request, res: Response) {
    try {
      //extract data from the request
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { username, password } = req.body

      assert(username && password && nivel && year, ErrorMessages.INVALID_REQUEST)
      const usersCollectionName = `users${nivel}`
      const empleadosCollectionName = `empleados${nivel}${year}`
      
      //fetch user from database
      const userCredentials = await User.getByUsername({ collectionName: usersCollectionName, username })
      assert(userCredentials != null, ErrorMessages.INVALID_CREDENTIALS)
      //validation of the password
      const isValidPassword = await compare(password, userCredentials.password)
      assert(isValidPassword, ErrorMessages.INVALID_CREDENTIALS)
      //fetch user info from database
      const userInfo = await User.getInfo({ collectionName: empleadosCollectionName, userId: userCredentials._id })
      assert(userInfo != null, ErrorMessages.INVALID_CREDENTIALS)
      const token = signToken({ _id: userCredentials._id.toString() })
      // const token = signToken({ _id: 'cristhiam' })
      return res.status(200).send(responseOk({ userInfo, token }))
    } catch (error) {
      return errorResponseHandler(res, error)
    }
  }

  static async verify(_req: Request, res: Response) {
    res.send('success')
  }
}
