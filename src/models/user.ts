import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'
import { UserCredentials, UserInfo } from '../types/user'
import { Nivel } from '../types/enums'

import { hashPassword } from '../utils/hashPassword'

const db = mongoClient.db()

export class User {
  static async crearNuevoUsuarioProfesor({ nivel, dni }: { nivel: Nivel; dni: number }) {
    const usersCollection = `users${nivel}`

    // const username = nombres.slice(0, 1) + apellidos.split(' ')[0] + apellidos.split(' ')[1].slice(0, 1)

    const password = await hashPassword('' + dni)
    const response = await db.collection(usersCollection).insertOne({ username: '' + dni, password })
    return response
  }

  static async getById({ nivel, _id }: { nivel: Nivel; _id: ObjectId }): Promise<WithId<UserCredentials> | null> {
    return new Promise(async (resolve) => {
      const user = db.collection<UserCredentials>(`users${nivel}`).findOne({ _id })
      resolve(user)
    })
  }

  static getByUsername({ collectionName, username }: { collectionName: string; username: string }): Promise<WithId<UserCredentials> | null> {
    return new Promise((resolve) => {
      const user = db.collection<UserCredentials>(collectionName).findOne({ username })
      resolve(user)
    })
  }
  static getProfesorInfo({ collectionName, userId }: { collectionName: string; userId: ObjectId }) {
    return new Promise((resolve) => {
      const userInfo = db.collection<UserInfo>(collectionName).findOne({ userId: userId, rol: 'profesor' })
      resolve(userInfo)
    })
  }
  static getInfo({ collectionName, userId }: { collectionName: string; userId: ObjectId }): Promise<WithId<UserInfo> | null> {
    return new Promise((resolve) => {
      const userInfo = db.collection<UserInfo>(collectionName).findOne({ userId: userId })
      resolve(userInfo)
    })
  }
}
