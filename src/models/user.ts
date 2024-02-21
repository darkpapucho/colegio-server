import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'
import { UserCredentials, UserInfo } from '../types/user'

const db = mongoClient.db()

export class User {
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
