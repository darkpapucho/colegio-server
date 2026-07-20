import { Periodo } from '../types/alumno'

//0-11;
export function getLastMonthToEvaluatePensiones(currentPeriodo: Periodo): number {
  switch (currentPeriodo) {
    case 'primerPeriodo':
      return 5
    case 'segundoPeriodo':
      return 7
    case 'tercerPeriodo':
      return 10
    case 'cuartoPeriodo':
    default:
      return 12
  }
}
