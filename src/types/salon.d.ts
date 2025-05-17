import { CURSO_SALON } from './cursos'
import {
  CursosLabelInicial,
  CursosLabelPrimaria,
  CursosKeyInicial,
  CursosKeyPrimaria,
  GradosInicial,
  GradosPrimaria,
  SalonesInicial,
  SalonesPrimaria,
  Secciones,
  Grado,
  Seccion,
} from './enums'

export interface SalonInicial {
  label: SalonesInicial
  grado: GradosInicial
  seccion: Secciones
  order: number
  cursos: {
    label: CursosLabelInicial
    key: CursosKeyInicial
  }
}
export interface SalonPrimaria {
  label: SalonesPrimaria
  grado: GradosPrimaria
  seccion: Secciones
  order: number
  cursos: {
    label: CursosLabelPrimaria
    key: CursosKeyPrimaria
  }
}
export interface Curso {
  label: CursosLabelInicial | CursosLabelPrimaria
  value: CursosValueInicial | CursosValuePrimaria
}

export type SalonProfesor = {
  label: string
  value: { grado: Grado; seccion: Seccion }
  order: number
  tutor: boolean
  cursos: CURSO_SALON[]
}
