import { ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { Nivel, Year } from '../types/enums'

export default class Announcements {
  static async fetchAllAnnouncements({ nivel, year }: { nivel: Nivel; year: Year }) {
    const cursor = mongoClient.db().collection(`anuncios${nivel}${year}`).find<{ _id: ObjectId; title: string; content: string; userId: ObjectId; date: string }>({})
    const result = []
    for await (const doc of cursor) {
      result.push(doc)
    }
    return result
  }
  static async addAnnouncement({ nivel, year, userId, date, content, title }: { title: string; nivel: Nivel; userId: string | ObjectId; year: Year; date: string; content: string }) {
    const response = await mongoClient
      .db()
      .collection(`anuncios${nivel}${year}`)
      .insertOne({ userId: new ObjectId(userId), date, content, title })
    return response
  }
}
