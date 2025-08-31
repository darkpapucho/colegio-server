import { ErrorMessages } from '../error/enums'
import { Periodo } from '../types/alumno'
import { Month, VALID_MONTHS } from '../types/asistencia'
import { MONTHS_YEAR } from '../utils/calendario'

export const primerPeriodoStart = '03-03-2025' //MM-DD-YYYY
export const primerPeriodoEnd = '05-09-2025'
export const segundoPeriodoStart = '05-12-2025'
export const segundoPeriodoEnd = '07-18-2025'
export const tercerPeriodoStart = '08-04-2025'
export const tercerPeriodoEnd = '10-10-2025'
export const cuartoPeriodoStart = '10-13-2025'
export const cuartoPeriodoEnd = '12-19-2025'

export function getPeriodoStartDate(periodo: Periodo) {
  switch (periodo) {
    case 'primerPeriodo':
      return primerPeriodoStart
    case 'segundoPeriodo':
      return segundoPeriodoStart
    case 'tercerPeriodo':
      return tercerPeriodoStart
    case 'cuartoPeriodo':
      return cuartoPeriodoStart
    default:
      throw new Error(ErrorMessages.INVALID_REQUEST)
  }
}
export function getPeriodoEndDate(periodo: Periodo) {
  switch (periodo) {
    case 'primerPeriodo':
      return primerPeriodoEnd
    case 'segundoPeriodo':
      return segundoPeriodoEnd
    case 'tercerPeriodo':
      return tercerPeriodoEnd
    case 'cuartoPeriodo':
      return cuartoPeriodoEnd
    default:
      throw new Error(ErrorMessages.INVALID_REQUEST)
  }
}

export function convertNumberToMonthName(monthNumber: number): Month {
  if (monthNumber < 0 || monthNumber > 11) throw new Error(ErrorMessages.INVALID_REQUEST)
  return MONTHS_YEAR[monthNumber]
}

export function parseMonthNameToMonthNumber1to12(monthName: Month) {
  return VALID_MONTHS.findIndex((month) => month === monthName.toLowerCase()) + 1
}
