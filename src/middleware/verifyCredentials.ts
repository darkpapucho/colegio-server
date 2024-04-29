import { NextFunction, Request, Response } from 'express'
import { signToken, verifyToken } from '../utils/jwt'
import { assert, extractNivelYearFromHeaders } from '../utils/global'
import { ErrorMessages } from '../error/enums'
import { errorResponseHandler } from '../error/errors'
import { User } from '../models/user'
import { ObjectId } from 'mongodb'

export const verifyCredentials = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.get('Token')
  try {
    const { nivel } = extractNivelYearFromHeaders(req)
    assert(token != undefined, ErrorMessages.INVALID_REQUEST)
    const userID = verifyToken(token)
    const user = await User.getById({ _id: new ObjectId(userID), nivel })
    if (!user) {
      throw new Error(ErrorMessages.INVALID_CREDENTIALS)
    }
    req.body.issuer = userID
    const refreshedToken = signToken({ _id: userID })
    res.setHeader('Token', refreshedToken)
    return next()
  } catch (error) {
    errorResponseHandler(res, error)
  }
}
