import { Sexo, Grado, Seccion, Secciones } from './enums'

type EstadoMatricula = 'DEFINITIVA' | 'EN PROCESO' | 'PENDIENTE' | 'TRASLADADO'

export interface AMatriculado {
  _id: string
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
