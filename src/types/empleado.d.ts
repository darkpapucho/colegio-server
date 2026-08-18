import { ObjectId } from 'mongodb'
import { EmpleadoRole, SalonProfesor } from './user'
import { Nivel } from './enums'
interface EmpleadoAsistenciaRecord {
  day: number
  month: number
  time: string
}
interface EmpleadoAsistenciaInfoBase {
  empleadoId: ObjectId
  fingerprintId: number
  nombres: string
  apellidos: string
  asistencias: EmpleadoAsistenciaRecord[]
}

interface ConNivelEmpleadoInfo extends EmpleadoAsistenciaInfoBase {
  rol: 'profesor' | 'psicologo'
  nivel: Nivel
}

interface SinNivelEmpleadoInfo extends EmpleadoAsistenciaInfoBase {
  rol: 'conserje'
}

export type EmpleadoAsistenciaInfo = ConNivelEmpleadoInfo | SinNivelEmpleadoInfo
