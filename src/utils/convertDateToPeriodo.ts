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
  const dateTime = date.getTime()

  if (dateTime >= new Date(primerPeriodoStart).getTime() && dateTime <= new Date(primerPeriodoEnd).getTime()) {
    return 'primerPeriodo'
  } else if (dateTime >= new Date(segundoPeriodoStart).getTime() && dateTime <= new Date(segundoPeriodoEnd).getTime()) {
    return 'segundoPeriodo'
  } else if (dateTime >= new Date(tercerPeriodoStart).getTime() && dateTime <= new Date(tercerPeriodoEnd).getTime()) {
    return 'tercerPeriodo'
  } else if (dateTime >= new Date(cuartoPeriodoStart).getTime() && dateTime <= new Date(cuartoPeriodoEnd).getTime()) {
    return 'cuartoPeriodo'
  } else {
    return 'primerPeriodo'
  }
}
