import { mongoClient } from '../db'

export default class FingerprintÇurrentId {
  static async getNextFingerId() {
    const response = await mongoClient.db().collection<{ currentId: number }>('fingerprintcurrentid').findOne({})
    if (response == null) {
      const insertResponse = await mongoClient.db().collection('fingerprintcurrentid').insertOne({ currentId: 1 })
      if (!insertResponse.insertedId) throw new Error('no se pudo obtener un id para la nueva huella digital')
      return 1
    }
    return response!.currentId + 1
  }
  static async increaseFingerId() {
    const response = await mongoClient
      .db()
      .collection('fingerprintcurrentid')
      .updateOne({}, { $inc: { currentId: 1 } })
    return response
  }
}
