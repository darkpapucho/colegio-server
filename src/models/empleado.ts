import { Nivel, Year } from '../types/enums'
import { mongoClient } from '../db'
import { ObjectId } from 'mongodb'
import { ProfesorData } from '../types/user'
export default class Empleado {
  static async crearProfesor({ nivel, year, data, userId }: { nivel: Nivel; year: Year; data: ProfesorData; userId: ObjectId }) {
    const empleadosCollection = `empleados${nivel}${year}`
    const response = mongoClient
      .db()
      .collection(empleadosCollection)
      .insertOne({ ...data, userId, rol: 'profesor' })
    return response
  }
}
