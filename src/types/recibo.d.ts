import { ObjectId } from 'mongodb'
import { Nivel } from './enums'

type OperacionPago = 'PEP' | 'PEI' | 'MAP' | 'MAI' | 'PES' | 'MAS'

type Recibo = {
  nivel: Nivel
  fecha: string
  alumnoId: ObjectId
  operacion: OperacionPago
}

interface ReciboData {
  numRecibo: number
  nivel: Nivel
  fecha: string
  operacion: OperacionPago
  detalles: {
    descripcion: string
    montoPagado: number
    mora?: number
  }
  alumno: {
    nombreCompleto: string
    grado: Grado
    seccion: Seccion
  }
}
