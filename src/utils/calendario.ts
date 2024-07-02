import { Month } from '../types/asistencia'
import { convertNumberToMonthName } from '../vars/periodosDates'

export const MONTHS_YEAR: Month[] = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function getMonthsBetween(beginDate: Date, endDate: Date, keyWord: string) {
  const betweenMonths = []
  for (let i = beginDate.getMonth() + 1; i < endDate.getMonth(); i++) {
    betweenMonths.push({ $eq: [keyWord, convertNumberToMonthName(i)] })
  }
  return betweenMonths
}
