import { ObjectId } from 'mongodb'
import { AMatriculado } from './alumno'
import { EstadoMatricula, Grado, GradoDestino, Nota, Seccion } from './enums'
export type TardanzaInasistencia = {
  justificadas: [number, number, number, number]
  injustificadas: [number, number, number, number]
}
export interface SelectedDocuments {
  certificadoNoAdeudo: boolean
  certificadoConducta: boolean
  resolucionTraslado: boolean
}

export type EmitirDocumentosData = {
  colegioDestino: string
  codigoModular: string
  selectedDocuments: SelectedDocuments
  gradoDestino: GradoDestino
  fechaEmision: string
}
export type CursoNotaRecord = {
  numCompetencias: number
  primerPeriodo: Nota[]
  segundoPeriodo: Nota[]
  tercerPeriodo: Nota[]
  cuartoPeriodo: Nota[]
}

export interface RegistroNota {
  alumnoId: string | ObjectId
  nombres: string
  apellidos: string
  estadoMatricula: EstadoMatricula
  grado: Grado
  seccion: Seccion
  conclusionesDescriptivas: [string, string, string, string]
  tardanzas: TardanzaInasistencia
  inasistencias: TardanzaInasistencia
  // [key: string]: CursoNotaRecord
  cursos: {
    [key: string]: CursoNotaRecord
  }
}

export interface ExtendedRegistroNota {
  alumnoId: string | ObjectId
  conclusionesDescriptivas: [string, string, string, string]
  tardanzas: TardanzaInasistencia
  inasistencias: TardanzaInasistencia
  // [key: string]: CursoNotaRecord
  cursos: {
    [key: string]: CursoNotaRecord
  }
  estudiante: [AMatriculado]
}

export type CURSO_BOLETA_NOTA = {
  label: string
  key: string
  competencias: string[]
}
