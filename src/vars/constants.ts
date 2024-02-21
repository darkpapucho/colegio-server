import { CURSO_BOLETA_NOTA } from '../types/documents'

export const JWT_DURATION = '2h'
export const JWT_ISSUER = 'jesus_nazareno_client'

//PRIMARIA
export const CURSOS_PRIMARIA_BOLETA_NOTAS: CURSO_BOLETA_NOTA[] = [
  { label: 'Personal Social', key: 'personalSocial', competencias: ['Construye su identidad.', 'Convive y participa democráticamente.', 'Construye interpretaciones históricas.', 'Gestiona responsablemente el espacio y el ambiente', 'Gestiona responsablemente los recursos económicos.'] },
  { label: 'Educación Física', key: 'educacionFisica', competencias: ['Se desenvuelve de manera autónoma.', 'Asume una vida saludable.', 'Interactúa a través de sus habilidades sociomotrices.'] },
  { label: 'Comunicación', key: 'comunicacion', competencias: ['Se comunica oralmente.', 'Lee diversos tipos de textos.', 'Escribe diversos tipos de textos.'] },
  { label: 'Arte y Cultura', key: 'arteCultura', competencias: ['Aprecia las manifestaciones artístico-culturales.', 'Crea proyectos desde los lenguajes artísticos.'] },
  { label: 'Inglés', key: 'ingles', competencias: ['Se comunica oralmente en inglés.', 'Lee diversos tipos de textos en inglés.', 'Escribe diversos tipos textos en inglés.'] },
  { label: 'Matemática', key: 'matematica', competencias: ['Resuelve problemas de cantidad.', 'Resuelve problemas de regularidad, equivalencia y cambio', 'Resuelve problemas de movimiento y localización.', 'Resuelve problemas de datos e incertidumbre.'] },
  { label: 'Ciencia y Tecnología', key: 'cienciaTecnologia', competencias: ['Indaga mediante métodos científicos.', 'Explica el mundo basándose en hechos científicos.', 'Diseña y construye soluciones tecnológicas.'] },
  { label: 'Educación Religiosa', key: 'religion', competencias: ['Construye su identidad como persona amada por Dios.', 'Asume a Dios en su proyecto de vida.'] },
  { label: 'Competencias Transversales', key: 'competenciasTransversales', competencias: ['Se desenvuelve en entornos virtuales generados por las TIC.', 'Gestiona su aprendizaje de manera autónoma.'] },
]
export const NUMERO_COMPETENCIAS_PRIMARIA = CURSOS_PRIMARIA_BOLETA_NOTAS.reduce((acc, current) => {
  return acc + current.competencias.length
}, 0)

//INICIAL 3y4 AÑOS

export const CURSOS_INICIAL_3_4_BOLETA_NOTAS: CURSO_BOLETA_NOTA[] = [
  { label: 'Personal Social', key: 'personalSocial', competencias: ['Construye su identidad.', 'Convive y participa democráticamente.', 'Construye una conciencia histórica.'] },
  { label: 'Psicomotriz', key: 'psicomotriz', competencias: ['Se desenvuelve de manera autónoma'] },
  { label: 'Comunicación', key: 'comunicacion', competencias: ['Se comunica oralmente.', 'Lee diversos tipos de textos.', 'Escribe diversos tipos de textos.', 'Crea proyectos desde los lenguajes del arte.'] },
  { label: 'Matemática', key: 'matematica', competencias: ['Resuelve problemas de cantidad.', 'Resuelve problemas de forma y movimiento.'] },
  { label: 'C. y Tecnología', key: 'cienciaTecnologia', competencias: ['Indaga e investiga mediante métodos científicos.'] },
]
export const NUMERO_COMPETENCIAS_3_4_INICIAL = CURSOS_INICIAL_3_4_BOLETA_NOTAS.reduce((acc, curr) => acc + curr.competencias.length, 0)

//INICIAL 5 AÑOS
export const CURSOS_INICIAL_5_BOLETA_NOTAS: CURSO_BOLETA_NOTA[] = [
  ...CURSOS_INICIAL_3_4_BOLETA_NOTAS,
  { label: 'Inglés', key: 'ingles', competencias: ['Se comunica oralmente en inglés.', 'Lee diversos tipos de textos en inglés.', 'Escribe diversos tipos textos en inglés.'] },
  { label: 'Competencias Transversales', key: 'competenciasTransversales', competencias: ['Se desenvuelve en entornos virtuales generados por la TIC.', 'Gestiona su aprendizaje de manera autónoma.'] },
]
export const NUMERO_COMPETENCIAS_5_INICIAL = CURSOS_INICIAL_5_BOLETA_NOTAS.reduce((acc, current) => {
  return acc + current.competencias.length
}, 0)

export const ESPACIOS_ENTRE_CURSOS_INICIAL: { [key: string]: number } = {
  personalSocial: 31,
  psicomotriz: 73,
  comunicacion: 129,
  matematica: 193,
  cienciaTecnologia: 227,
  ingles: 271,
  competenciasTransversales: 325,
}
// const SPACES = [0, 92, 156, 210, 262, 340, 417, 473, 513]
export const ESPACIOS_ENTRE_CURSOS_PRIMARIA: { [key: string]: number } = {
  personalSocial: 49,
  educacionFisica: 140,
  comunicacion: 203,
  arteCultura: 262,
  ingles: 317,
  matematica: 390,
  cienciaTecnologia: 467,
  religion: 522,
  competenciasTransversales: 568,
}
