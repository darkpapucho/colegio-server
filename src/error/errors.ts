import { Response } from 'express'
import { ErrorMessages } from './enums'
import { responseError } from '../utils/responses'
import { JsonWebTokenError } from 'jsonwebtoken'

export function assertIsError(error: unknown): asserts error is Error {
  if (error instanceof Error) return
  console.log(error)
  throw new Error(ErrorMessages.UNKNOWN_ERROR)
}

export function errorResponseHandler(res: Response, error: unknown) {
  console.log({ error })
  try {
    assertIsError(error)
    if (error.message === ErrorMessages.INVALID_CREDENTIALS) {
      return res.status(401).send(responseError(error.message))
    } else if (error.message === ErrorMessages.INVALID_REQUEST) {
      return res.status(400).send(responseError(error.message))
    } else if (error instanceof JsonWebTokenError) {
      console.log({ jwtMessage: error.message })
      return res.status(401).send(responseError(ErrorMessages.INVALID_TOKEN))
    } else {
      console.log({ error })
      return res.status(500).send(responseError(ErrorMessages.SERVER_ERROR))
    }
  } catch (err) {
    return res.status(500).send(responseError(ErrorMessages.UNKNOWN_ERROR))
  }
}
