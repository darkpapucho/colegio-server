import { ObjectId } from 'mongodb'
import { Sexo, Grado, Seccion, Secciones } from './enums'
import { Month } from './asistencia'

type TipoApoderado = 'MADRE' | 'PADRE' | 'APODERADO'
type Sexo = 'Hombre' | 'Mujer'

type NuevoApoderado = {
  apellidos: string
  nombres: string
  nombreCompleto: string
  dni: string
  correo: string
  telefono: string
  relacion: TipoApoderado
}

type Apoderado = NuevoApoderado & { _id: string }

type EstadoMatricula = 'DEFINITIVA' | 'SUSPENDIDO' | 'RETIRADO' | 'TRASLADADO'

export interface AMatriculado {
  _id: string | ObjectId
  // Alumno Matriculado
  nombres: string
  apellidos: string
  grado: Grado
  seccion: Seccion
  estadoMatricula: EstadoMatricula
  fechaMatricula: string
  fechaRetiro?: string
  sexo: Sexo
  dni?: string
  codigoEstudiante: string
  nombreCompleto: string
  apoderado?: Apoderado[]
}

export interface NuevoAlumno {
  nombres: string
  apellidos: string
  grado: Grado
  seccion: Seccion
  fechaMatricula: string
  sexo: Sexo
  dni?: string
  codigoEstudiante: string
}

export type AMatriculadoNoId = Omit<AMatriculado, '_id'>
export type PartialAlumno = {
  [item in keyof AMatriculado]: AMatriculado[item]
}

export type AsistenciaValue = 'A' | 'F' | 'T' | ''

export type AsistenciaList = {
  dayId: string
  month: string
  periodo: Periodo
  list: { alumnoId: string; asistencia: AsistenciaValue }[]
}

export type Periodo = 'primerPeriodo' | 'segundoPeriodo' | 'tercerPeriodo' | 'cuartoPeriodo'

export type AsistenciaRecord = {
  dayId: ObjectId
  day: number
  month: Month
  modified: string | Date
  asistencia: AsistenciaValue
}

export type Apoderado = {
  _id: string | ObjectId
  nombres: string
  apellidos: string
  dni: string
  telefono: string
  correo: string
  relacion: 'MADRE' | 'PADRE' | 'APODERADO'
}
