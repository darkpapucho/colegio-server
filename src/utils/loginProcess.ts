import { Request } from 'express'
import { assert, extractNivelYearFromHeaders } from './global'
import { ErrorMessages } from '../error/enums'
import { LoginRequestParams } from '../types/user'

export const getLoginRequestData = (request: Request): LoginRequestParams => {
  const { username, password } = request.body
  const { nivel, year } = extractNivelYearFromHeaders(request)

  assert(username && password && nivel && year, ErrorMessages.INVALID_REQUEST)
  const usersCollectionName = `users${nivel}`
  const empleadosCollectionName = `empleados${nivel}${year}`
  return { usersCollectionName, empleadosCollectionName, username, password }
}
