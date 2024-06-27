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
  if (date.getTime() >= new Date(primerPeriodoStart).getTime() && date.getTime() <= new Date(primerPeriodoEnd).getTime()) {
    return 'primerPeriodo'
  } else if (date.getTime() >= new Date(segundoPeriodoStart).getTime() && date.getTime() <= new Date(segundoPeriodoEnd).getTime()) {
    return 'segundoPeriodo'
  } else if (date >= new Date(tercerPeriodoStart) && date <= new Date(tercerPeriodoEnd)) {
    return 'tercerPeriodo'
  } else if (date >= new Date(cuartoPeriodoStart) && date <= new Date(cuartoPeriodoEnd)) {
    return 'cuartoPeriodo'
  } else {
    return 'primerPeriodo'
  }
}
