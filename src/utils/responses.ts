import { ResponseError, ResponseOk } from '../types/responses'

export const responseOk = (payload: any): ResponseOk => {
  return { ok: true, payload }
}

export const responseError = (message: string): ResponseError => {
  return { ok: false, message }
}
