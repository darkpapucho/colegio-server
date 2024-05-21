import { Periodo } from '../types/alumno'
import {
  cuartoPeriodoEnd,
  cuartoPeriodoStart,
  primerPeriodoEnd,
  primerPeriodoStart,
  segundoPeriodoEnd,
  segundoPeriodoStart,
  tercerPeriodoEnd,
  tercerPeriodoStart,
} from '../vars/periodosDates'

export default function convertDateToPeriodo(date: Date): Periodo {
  let periodo: Periodo = 'primerPeriodo'
  if (date >= new Date(primerPeriodoStart) && date <= new Date(primerPeriodoEnd)) {
    periodo = 'primerPeriodo'
  } else if (date >= new Date(segundoPeriodoStart) && date <= new Date(segundoPeriodoEnd)) {
    periodo = 'segundoPeriodo'
  } else if (date >= new Date(tercerPeriodoStart) && date <= new Date(tercerPeriodoEnd)) {
    periodo = 'tercerPeriodo'
  } else if (date >= new Date(cuartoPeriodoStart) && date <= new Date(cuartoPeriodoEnd)) {
    periodo = 'cuartoPeriodo'
  }
  return periodo
}
