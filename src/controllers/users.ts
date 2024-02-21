import { Response, Request } from 'express'
import { responseOk } from '../utils/responses'
import { errorResponseHandler } from '../error/errors'
import { getLoginRequestData } from '../utils/loginProcess'
import { signToken } from '../utils/jwt'
import { User } from '../models/user'
import { assert } from '../utils/global'
import { ErrorMessages } from '../error/enums'
import { compare } from 'bcrypt'
// import { generateJWKS } from '../utils/generateJWKS'

export class UserControllers {
  static async login(req: Request, res: Response) {
    try {
      //extract data from the request
      const { usersCollectionName, empleadosCollectionName, username, password } = getLoginRequestData(req)
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
      return res.status(200).send(responseOk({ userInfo, token }))
    } catch (error) {
      return errorResponseHandler(res, error)
    }
  }

  static async verify(_req: Request, res: Response) {
    res.send('success')
  }
}
