import { ObjectId } from 'mongodb'
import { EstadoMatricula } from './enums'

export type NotasBimestral = [number, number, number, number]

export type QueryTutor = {
  inasistencias?: { justificadas: NotasBimestral; injustificadas: NotasBimestral }
  tardanzas?: { justificadas: NotasBimestral; injustificadas: NotasBimestral }
  conducta?: NotasBimestral
  conclusionesDescriptivas?: [string, string, string, string]
  conductaPPFF?: NotasBimestral
}
export type QueryProfesor = {
  [key: string]: NotasBimestral
}
export type RecordNotas = {
  alumnoId: ObjectId | string
  estadoMatricula: EstadoMatricula
  alumno: string
  cursos: {
    [key: string]: NotasBimestral
  }
  inasistencias: { justificadas: NotasBimestral; injustificadas: NotasBimestral }
  tardanzas: { justificadas: NotasBimestral; injustificadas: NotasBimestral }
  conducta: NotasBimestral
  conclusionesDescriptivas: [string, string, string, string]
  conductaPPFF: NotasBimestral
}
