import { cuartoPeriodoEnd, cuartoPeriodoStart, segundoPeriodoStart, tercerPeriodoStart } from '../vars/periodosDates'

//0-11;
export function getLastMonthToEvaluatePensiones(): number {
  const currentDate = new Date()
  if (currentDate >= new Date(segundoPeriodoStart) && currentDate < new Date(tercerPeriodoStart)) {
    return 4
  } else if (currentDate >= new Date(tercerPeriodoStart) && currentDate < new Date(cuartoPeriodoStart)) {
    return 6
  } else if (currentDate >= new Date(cuartoPeriodoStart) && currentDate < new Date(cuartoPeriodoEnd)) {
    return 9
  } else {
    return 11
  }
}
