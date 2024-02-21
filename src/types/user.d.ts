import { ObjectId, WithId } from 'mongodb'
import { GradosPrimaria, Niveles, SalonesInicial, SalonesPrimaria, Secciones } from './enums'
import { SalonInicial, SalonPrimaria } from './salon'

type UserType = 'admin' | 'profesor'

interface UserCredentials {
  //_id: ObjectId
  username: string
  password: string
}

interface UserInfo {
  //_id: ObjectId
  userId: ObjectId
  nombres: string
  apellidos: string
  type: UserType
  dni: string
  correo: string
  telefono: string
  specificInfo?: {
    salones: SalonInicial[] | SalonPrimaria[]
  }
}

export interface LoginRequestParams {
  username: string
  password: string
  usersCollectionName: string
  empleadosCollectionName: string
}

export interface TokenPayload {
  iat: number
  exp: number
  _id: ObjectId
}

export type UserID = ObjectId

export interface SelectedDocuments {
  certificadoNoAdeudo: boolean
  certificadoConducta: boolean
  resolucionTraslado: boolean
}
