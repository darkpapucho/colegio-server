import { Request } from 'express'
import { ErrorMessages } from '../error/enums'
import { Grado, Nivel, Seccion, VALID_GRADOS, VALID_NIVELES, VALID_SECCIONES, VALID_YEARS, Year } from '../types/enums'

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function assertYear(year: any): asserts year is Year {
  if (VALID_YEARS.includes(year)) return year
  else throw new Error(ErrorMessages.INVALID_REQUEST)
}

function assertNivel(nivel: any): asserts nivel is Nivel {
  if (VALID_NIVELES.includes(nivel)) return
  else throw new Error(ErrorMessages.INVALID_REQUEST)
}

export function assertGrado(grado: any): asserts grado is Grado {
  if (VALID_GRADOS.includes(grado)) return
  else throw new Error(ErrorMessages.INVALID_REQUEST)
}

export function assertSeccion(seccion: any): asserts seccion is Seccion {
  if (VALID_SECCIONES.includes(seccion)) return
  else throw new Error(ErrorMessages.INVALID_REQUEST)
}

export function extractNivelYearFromHeaders(request: Request): { nivel: Nivel; year: Year } {
  const nivel: string | undefined = request.get('nivel')
  const year: string | undefined = request.get('year')

  if (!year || !nivel) throw new Error(ErrorMessages.INVALID_REQUEST)
  const año = year
  assertYear(año)
  assertNivel(nivel)
  return { nivel, year: año }
}
