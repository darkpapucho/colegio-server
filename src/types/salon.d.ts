import { CursosLabelInicial, CursosLabelPrimaria, CursosKeyInicial, CursosKeyPrimaria, GradosInicial, GradosPrimaria, SalonesInicial, SalonesPrimaria, Secciones } from './enums'

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
