import { Nivel, Year } from '../types/enums'
import { mongoClient } from '../db'
import { ObjectId } from 'mongodb'
import { ProfesorData } from '../types/user'
import { Profesor } from '../types/empleado'
import { hashPassword } from '../utils/hashPassword'
export default class Empleado {
  static async updateProfesorPassword({ newPassword, userId, nivel }: { nivel: Nivel; userId: string; newPassword: string }) {
    const hashedPass = await hashPassword(newPassword)
    const response = await mongoClient
      .db()
      .collection(`users${nivel}`)
      .updateOne({ _id: new ObjectId(userId) }, { $set: { password: hashedPass } })
    return response
  }
  static async updateProfesor({ nivel, year, profesor }: { nivel: Nivel; year: Year; profesor: Profesor }) {
    const { _id, userId, ...rest } = profesor
    const collectionName = `empleados${nivel}${year}`
    const response = await mongoClient
      .db()
      .collection(collectionName)
      .updateOne({ _id: new ObjectId(_id) }, { $set: { ...rest } })
    return response
  }
  static async crearProfesor({ nivel, year, data, userId }: { nivel: Nivel; year: Year; data: ProfesorData; userId: ObjectId }) {
    const empleadosCollection = `empleados${nivel}${year}`
    const response = mongoClient
      .db()
      .collection(empleadosCollection)
      .insertOne({ ...data, userId, rol: 'profesor' })
    return response
  }
  static async fetchProfesores({ nivel, year }: { nivel: Nivel; year: Year }) {
    const collectionName = `empleados${nivel}${year}`
    const cursor = mongoClient.db().collection<Profesor>(collectionName).find({ rol: 'profesor' })
    const profesores: Profesor[] = []
    for await (const doc of cursor) {
      profesores.push(doc)
    }
    return profesores
  }
}
