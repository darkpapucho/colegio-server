import * as jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import assert from 'assert'
import { TokenPayload, UserID } from '../types/user'
import { ErrorMessages } from '../error/enums'
import { JWT_DURATION, JWT_ISSUER } from '../vars/constants'
config()

const JWT_SECRET = process.env.JWT_SECRET

export const signToken = (payload: jwt.JwtPayload) => {
  
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: JWT_DURATION, issuer: JWT_ISSUER })
}

export const verifyToken = (token: string): UserID => {
  const payload = jwt.verify(token, JWT_SECRET!) as TokenPayload
  assert(payload, ErrorMessages.INVALID_TOKEN)
  return payload._id
}
