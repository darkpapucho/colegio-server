import { ObjectId } from 'mongodb'
import { mongoClient } from '../db'

export default class Asistencia {
  static async marcarAsistencia({ userId, timestamp, dayId }: { userId: string; timestamp: string; dayId: string }) {
    const response = await mongoClient
      .db()
      .collection('asistencias2026')
      .updateOne({ userId: new ObjectId(userId), 'asistencia.dayId': new ObjectId(dayId) }, { $set: { 'asistencia.$.timestamp': timestamp } })
    return response
  }
}
