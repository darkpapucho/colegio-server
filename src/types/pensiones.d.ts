import { ObjectId } from 'mongodb'

export type PensionRecord = {
  mes: number
  pagado: boolean
  monto_pagar: number
  monto_pagado: number
  fecha: string
  reciboId?: ObjectId | null
}

export type PensionTable = {
  alumnoId: ObjectId
  pensiones: PensionRecord[]
  reciboMatricula?: string
  estudiante: AMatriculado
  numPensionesPagadas: number
  montoMatricula: Number
}
