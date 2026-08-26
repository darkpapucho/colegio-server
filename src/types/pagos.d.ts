import { ObjectId } from 'mongodb'
import { AMatriculado } from './alumno'

export type DeudaStatus = 'pendiente' | 'cancelado'
export type ItemDeuda = {
  _id: ObjectId
  descripcion: string
  precio_unitario: number
  cantidad: number
  abonado: number
  lastUpdateDate: string
  fecha: string
}
export type DeudaInfo = {
  deudaTotal: number
  abonado: number
  status: DeudaStatus
  lastUpdateDate?: string
  fechaPagoTotal?: string
  items: ItemDeuda[]
}
export type OtrasDeudas = {
  alumnoId: ObjectId
  deuda: DeudaInfo
}
