import { ObjectId } from 'mongodb'

type PensionRecord = {
  mes: number
  pagado: boolean
  monto_pagar: number
  monto_pagado: number
  fecha: string
  reciboId?: ObjectId | null
}
