import { z } from 'zod'
import { ESTADOS_MATRICULA, VALID_GRADOS, VALID_GRADOS_DESTINO, VALID_SECCIONES, VALID_SEXOS } from '../types/enums'
import { AMatriculado, NuevoAlumno } from '../types/alumno'
import { ErrorMessages } from '../error/enums'
import { EmitirDocumentosData } from '../types/documents'

export function assertIsString(value: unknown): asserts value is string {
  console.log(typeof value)
  if (typeof value === 'string') return
  throw new Error(`Invalid String Value: ${value}`)
}

const nuevoAlumnoSchema = z.object({
  nombres: z.string().min(4).max(30),
  apellidos: z.string().min(4).max(30),
  grado: z.enum(VALID_GRADOS),
  seccion: z.enum(VALID_SECCIONES),
  fechaMatricula: z.string(),
  sexo: z.enum(VALID_SEXOS),
  dni: z.string().length(8).optional(),
  codigoEstudiante: z.string().length(14),
})

export function assertIsNuevoAlumno(alumno: any): asserts alumno is NuevoAlumno {
  const result = nuevoAlumnoSchema.safeParse(alumno)

  if (result.success) {
    return
  } else {
    result.error.issues.forEach((issue) => console.log({ message: issue.message, field: issue.path[0] }))
    console.log('invalid alumno')
    throw new Error(ErrorMessages.INVALID_REQUEST)
  }
}

const AMatriculadoSchema = z.object({
  nombres: z.string({ required_error: 'nombres del alumno son obligatorios' }).min(4, 'nombres debe tener al menos 4 caracteres').max(25, 'nombres no debe tener mas de 40 caracteres'),
  apellidos: z.string({ required_error: 'apellidos del alumno son obligatorios' }).min(4, 'apellidos debe tener al menos 4 caracteres').max(25, 'apellidos no debe tener mas de 40 caracteres'),
  grado: z.enum(VALID_GRADOS, { invalid_type_error: 'grado inválido' }),
  seccion: z.enum(VALID_SECCIONES, { invalid_type_error: 'seccion inválida' }),
  estadoMatricula: z.enum(ESTADOS_MATRICULA, { invalid_type_error: 'invalido estado de matrícula' }),
  fechaMatricula: z.string({ required_error: 'falta la fecha de matrícula' }).datetime({ message: 'fecha de matrícula inválida' }),
  fechaRetiro: z.string().datetime({ message: 'fecha de retiro inválida' }).optional(),
  sexo: z.enum(VALID_SEXOS, { invalid_type_error: 'sexo del alumno no válido' }),
  dni: z.string().min(8, 'el dni debe tener 8 digitos').max(8, 'el dni debe tener 8 dígitos').optional(),
  codigoEstudiante: z.string({ required_error: 'falta el codigo de estudiante del alumno' }).min(14, 'el codigo de estudiante debe tener 14 dígitos').max(14, 'el codigo de estudiante debe tener 14 dígitos'),
  nombreCompleto: z.string({ required_error: 'faltan los datos del alumno' }).max(52, 'los datos del alumno no deben exceder los 52 caracteres'),
})

const EmitirDocumentosDataSchema = z.object({
  colegioDestino: z.string(),
  codigoModular: z.string(),
  selectedDocuments: z.object({ resolucionTraslado: z.boolean(), certificadoNoAdeudo: z.boolean(), certificadoConducta: z.boolean() }),
  fechaEmision: z.string(),
  gradoDestino: z.enum(VALID_GRADOS_DESTINO),
})

export function assertIsAMatriculado(alumno: any): asserts alumno is AMatriculado {
  const result = AMatriculadoSchema.safeParse(alumno)

  if (!result.success) {
    throw new Error(result.error.issues[0].message)
  }
  return
}

export function assertIsEmitirDocumentsData(data: any): asserts data is EmitirDocumentosData {
  const result = EmitirDocumentosDataSchema.safeParse(data)

  if (!result.success) {
    throw new Error(ErrorMessages.INVALID_REQUEST)
  }
  return
}
