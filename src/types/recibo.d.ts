import { ObjectId } from 'mongodb'
import { Nivel } from './enums'

type OperacionPago = 'PEP' | 'PEI' | 'MAP' | 'MAI'

type Recibo = {
  nivel: Nivel
  fecha: string
  alumnoId: ObjectId
  operacion: OperacionPago
}
