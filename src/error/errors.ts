import { Response } from 'express'
import { ErrorMessages } from './enums'
import { responseError } from '../utils/responses'
import { JsonWebTokenError } from 'jsonwebtoken'
import { MongoServerError } from 'mongodb'

export function assertIsError(error: unknown): asserts error is Error {
  if (error instanceof Error) return
  console.log(error)
  throw new Error(ErrorMessages.UNKNOWN_ERROR)
}

export function errorResponseHandler(res: Response, error: unknown) {
  console.log({ error })
  try {
    assertIsError(error)
    if (error instanceof MongoServerError) {
      return res.send(responseError(ErrorMessages.SERVER_ERROR))
    } else if (error.message === ErrorMessages.INVALID_CREDENTIALS) {
      return res.send(responseError(error.message))
    } else if (error.message === ErrorMessages.INVALID_REQUEST) {
      return res.send(responseError(error.message))
    } else if (error instanceof JsonWebTokenError) {
      console.log({ jwtMessage: error.message })
      return res.send(responseError(ErrorMessages.INVALID_TOKEN))
    } else if (error.message === ErrorMessages.USER_ALREADY_EXISTS) {
      return res.status(406).send(responseError(error.message))
    } else {
      console.log({ error })
      return res.send(responseError(ErrorMessages.SERVER_ERROR))
    }
  } catch (err) {
    return res.send(responseError(ErrorMessages.UNKNOWN_ERROR))
  }
}
