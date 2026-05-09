import { SafeParseReturnType, z } from 'zod'
import { ESTADOS_MATRICULA, Nivel, VALID_GRADOS, VALID_GRADOS_DESTINO, VALID_SECCIONES, VALID_SEXOS } from '../types/enums'
import { AMatriculado, NuevoAlumno } from '../types/alumno'
import { ErrorMessages } from '../error/enums'
import { EmitirDocumentosData } from '../types/documents'
import { ProfesorData } from '../types/user'

export function assertIsString(value: unknown): asserts value is string {
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
  dni: z
    .string()
    .optional()
    .refine((value) => value == undefined || value === '' || value?.length === 8, { message: 'el dni debe ser de 8 dígitos' }),
  codigoEstudiante: z
    .string({ required_error: 'falta el codigo de estudiante del alumno' })
    .optional()
    .refine((value) => {
      let isValid = false
      if (value == undefined || value == '') {
        isValid = true
      } else if (value && value != '') {
        isValid = value.length == 14
      }
      return isValid
    }),
})
const profesorInicialDataSchema = z.object({
  // userId: z.string(),
  // rol: z.string(),
  nombres: z.string().min(3).max(30),
  apellidos: z.string().min(3).max(30),
  dni: z.string().length(8),
  telefono: z.number().optional(),
  correo: z.string().min(10).email().optional(),
})

const profesorDataSchema = z.object({
  // userId: z.string(),
  // rol: z.string(),
  nombres: z.string().min(3).max(30),
  apellidos: z.string().min(3).max(30),
  dni: z.string().length(8),
  telefono: z.number().optional(),
  correo: z.string().min(10).email().optional(),
  salones: z
    .object({
      label: z.string(),
      value: z.object({
        grado: z.enum(VALID_GRADOS),
        seccion: z.enum(VALID_SECCIONES),
      }),
      tutor: z.boolean(),
      order: z.number(),
      cursos: z.object({ label: z.string(), key: z.string() }).array(),
    })
    .array(),
})
export function assertIsNuevoAlumno(alumno: any): asserts alumno is NuevoAlumno {
  const result = nuevoAlumnoSchema.safeParse(alumno)

  if (result.success) {
    return
  } else {
    result.error.issues.forEach((issue) => console.log({ message: issue.message, field: issue.path[0] }))

    throw new Error(ErrorMessages.INVALID_REQUEST)
  }
}

const AMatriculadoSchema = z.object({
  nombres: z
    .string({ required_error: 'nombres del alumno son obligatorios' })
    .min(4, 'nombres debe tener al menos 4 caracteres')
    .max(25, 'nombres no debe tener mas de 40 caracteres'),
  apellidos: z
    .string({ required_error: 'apellidos del alumno son obligatorios' })
    .min(4, 'apellidos debe tener al menos 4 caracteres')
    .max(25, 'apellidos no debe tener mas de 40 caracteres'),
  grado: z.enum(VALID_GRADOS, { invalid_type_error: 'grado inválido' }),
  seccion: z.enum(VALID_SECCIONES, { invalid_type_error: 'seccion inválida' }),
  estadoMatricula: z.enum(ESTADOS_MATRICULA, { invalid_type_error: 'invalido estado de matrícula' }),
  fechaMatricula: z.string({ required_error: 'falta la fecha de matrícula' }).datetime({ message: 'fecha de matrícula inválida' }),
  // fechaRetiro: z.string().datetime({ message: 'fecha de retiro inválida' }).optional(),
  sexo: z.enum(VALID_SEXOS, { invalid_type_error: 'sexo del alumno no válido' }),
  dni: z.string().refine((value) => value === '' || value?.length === 8, { message: 'el dni debe ser de 8 dígitos' }),
  codigoEstudiante: z
    .string({ required_error: 'falta el codigo de estudiante del alumno' })
    .min(14, 'el codigo de estudiante debe tener 14 dígitos')
    .max(14, 'el codigo de estudiante debe tener 14 dígitos'),
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

export function assertIsProfesorData(data: any, nivel: Nivel): asserts data is ProfesorData {
  let result: SafeParseReturnType<any, any>
  if (nivel === 'inicial') {
    result = profesorInicialDataSchema.safeParse(data)
  } else {
    result = profesorDataSchema.safeParse(data)
  }
  if (!result.success) {
    throw new Error(ErrorMessages.INVALID_REQUEST)
  }
  return
}
