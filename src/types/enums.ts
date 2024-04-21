export const VALID_NOTAS = ['A', 'B', 'C', 'AD'] as const
export type Nota = (typeof VALID_NOTAS)[number]
//grados destino
export const VALID_GRADOS_DESTINO = ['Grupo 3 años', 'Grupo 4 años', 'Grupo 5 años', 'PRIMERO PRIMARIA', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO', 'PRIMERO SECUNDARIA'] as const
export type GradoDestino = (typeof VALID_GRADOS_DESTINO)[number]
// estados matricula
export const ESTADOS_MATRICULA = ['DEFINITIVA', 'PENDIENTE', 'TRASLADADO', 'EN PROCESO'] as const
export type EstadoMatricula = (typeof ESTADOS_MATRICULA)[number]
//years
export const VALID_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025'] as const
export type Year = (typeof VALID_YEARS)[number]

//sexo
export const VALID_SEXOS = ['Hombre', 'Mujer'] as const
export type Sexo = (typeof VALID_SEXOS)[number]

//Niveles
export const VALID_NIVELES = ['primaria', 'inicial'] as const
export type Nivel = (typeof VALID_NIVELES)[number]
export enum Niveles {
  PRIMARIA = 'primaria',
  INICIAL = 'inicial',
}

//secciones
export const VALID_SECCIONES = ['A', 'B', 'C'] as const
export type Seccion = (typeof VALID_SECCIONES)[number]
export enum Secciones {
  A = 'A',
  B = 'B',
  c = 'C',
}

//grados
export const VALID_GRADOS = ['Grupo 3 años', 'Grupo 4 años', 'Grupo 5 años', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO'] as const
export type Grado = (typeof VALID_GRADOS)[number]
export enum GradosPrimaria {
  PRIMERO = 'PRIMERO',
  SEGUNDO = 'SEGUNDO',
  TERCERO = 'TERCERO',
  CUARTO = 'CUARTO',
  QUINTO = 'QUINTO',
  SEXTO = 'SEXTO',
}
export enum GradosInicial {
  Grupo3años = 'Grupo 3 años',
  Grupo4años = 'Grupo 4 años',
  Grupo5años = 'Grupo 5 años',
}

//SALONES
export enum SalonesInicial {
  Grupo3años_A = 'Grupo 3 años A',
  Grupo3años_B = 'Grupo 3 años B',
  Grupo3años_C = 'Grupo 3 años C',
  Grupo4años_A = 'Grupo 4 años A',
  Grupo4años_B = 'Grupo 4 años B',
  Grupo4años_C = 'Grupo 4 años C',
  Grupo5años_A = 'Grupo 5 años A',
  Grupo5años_B = 'Grupo 5 años B',
  Grupo5años_C = 'Grupo 5 años C',
}
export enum SalonesPrimaria {
  PRIMERO_A = 'PRIMERO A',
  PRIMERO_B = 'PRIMERO B',
  PRIMERO_C = 'PRIMERO C',
  SEGUNDO_A = 'SEGUNDO A',
  SEGUNDO_B = 'SEGUNDO B',
  SEGUNDO_C = 'SEGUNDO C',
  TERCERO_A = 'TERCERO A',
  TERCERO_B = 'TERCERO B',
  TERCERO_C = 'TERCERO C',
  CUARTO_A = 'CUARTO A',
  CUARTO_B = 'CUARTO B',
  CUARTO_C = 'CUARTO C',
  QUINTO_A = 'QUINTO A',
  QUINTO_B = 'QUINTO B',
  QUINTO_C = 'QUINTO C',
  SEXTO_A = 'SEXTO A',
  SEXTO_B = 'SEXTO B',
  SEXTO_C = 'SEXTO C',
}

//CURSOS
export enum CursosLabelPrimaria {
  MATEMATICA = 'Matemática',
  CIENCIA_TECNOLOGIA = 'Ciencia y Tecnología',
  PERSONAL_SOCIAL = 'Personal Social',
  EDUCACION_FISICA = 'Educación Física',
  COMUNICACION = 'Comunicación',
  ARTE_CULTURA = 'Arte y Cultura',
  INGLES = 'Inglés como lengua extranjera',
  RELIGION = 'Educación Religiosa',
  COMPETENCIAS_TRANSVERSALES = 'Competencias Transversales',
}
export enum CursosKeyPrimaria {
  MATEMATICA = 'matematica',
  CIENCIA_TECNOLOGIA = 'cienciaTecnologia',
  PERSONAL_SOCIAL = 'personalSocial',
  EDUCACION_FISICA = 'educacionFisica',
  COMUNICACION = 'comunicacion',
  ARTE_CULTURA = 'arteCultura',
  INGLES = 'ingles',
  RELIGION = 'religion',
  COMPETENCIAS_TRANSVERSALES = 'competenciasTransversales',
}
export enum CursosLabelInicial {
  MATEMATICA = 'Matemática',
  CIENCIA_TECNOLOGIA = 'Ciencia y Tecnología',
  PERSONAL_SOCIAL = 'Personal Social',
  COMUNICACION = 'Comunicación',
  PSICOMOTRIZ = 'Psicomotriz',
  COMPETENCIAS_TRANSVERSALES = 'Competencias Transversales',
}
export enum CursosKeyInicial {
  MATEMATICA = 'matematica',
  CIENCIA_TECNOLOGIA = 'cienciaTecnologia',
  PERSONAL_SOCIAL = 'personalSocial',
  COMUNICACION = 'comunicacion',
  PSICOMOTRIZ = 'psicomotriz',
  COMPETENCIAS_TRANSVERSALES = 'competenciasTransversales',
}
