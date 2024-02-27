import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'
import { UserCredentials, UserInfo } from '../types/user'
import { Nivel } from '../types/enums'
import { hash } from 'bcrypt'

const db = mongoClient.db()

export class User {
  static async crearNuevoUsuarioProfesor({ nivel, dni }: { nivel: Nivel; dni: number }) {
    console.log({ dni })
    const usersCollection = `users${nivel}`

    // const username = nombres.slice(0, 1) + apellidos.split(' ')[0] + apellidos.split(' ')[1].slice(0, 1)

    const password = await hash('' + dni, 10)
    const response = await db.collection(usersCollection).insertOne({ username: '' + dni, password })
    return response
  }

  static async getById({ collectionName, _id }: { collectionName: string; _id: ObjectId }) {
    return new Promise(async (resolve) => {
      const user = db.collection(collectionName).findOne({ _id })
      resolve(user)
    })
  }

  static getByUsername({ collectionName, username }: { collectionName: string; username: string }): Promise<WithId<UserCredentials> | null> {
    return new Promise((resolve) => {
      const user = db.collection<UserCredentials>(collectionName).findOne({ username })
      resolve(user)
    })
  }

  static getInfo({ collectionName, userId }: { collectionName: string; userId: ObjectId }): Promise<WithId<UserInfo> | null> {
    return new Promise((resolve) => {
      const userInfo = db.collection<UserInfo>(collectionName).findOne({ userId: userId })
      resolve(userInfo)
    })
  }
}
