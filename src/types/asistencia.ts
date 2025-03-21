import { ObjectId } from 'mongodb'
import { Grado, Seccion } from './enums'

export const VALID_MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const
export type Month = (typeof VALID_MONTHS)[number]
// export type Month = 'enero' | 'febrero' | 'marzo' | 'abril' | 'mayo' | 'junio' | 'julio' | 'agosto' | 'septiembre' | 'octubre' | 'noviembre' | 'diciembre'
export type CalendarioDay = {
  day: number
  month: Month
  status: 'enabled' | 'disabled'
  createdAt: Date
  salones: {
    grado: Grado
    seccion: Seccion
    done: Boolean
    issuer: ObjectId
    modified: Date
  }[]
}
