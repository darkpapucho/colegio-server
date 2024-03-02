import { ObjectId } from 'mongodb'
import { SalonProfesor } from './user'

export type Profesor = {
  nombres: string
  apellidos: string
  dni: number
  salones: SalonProfesor[]
  rol: 'profesor'
  userId: string | ObjectId
  _id: string | ObjectId
}
