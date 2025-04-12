import { ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { Nivel, Year } from '../types/enums'

export default class AnotacionesRelevantes {
  static async editarAnotacionByAlumnoId({ nivel, year, alumnoId, issuer, fecha, detalle }: { nivel: Nivel; year: Year; alumnoId: string; issuer: string; fecha: string; detalle: string }) {
    const response = await mongoClient
      .db()
      .collection(`anotacionesRelevantes${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $set: { fecha, issuer: new ObjectId(issuer), detalle } }, { upsert: true })
    return response
  }
  static async fetchAnotacionByAlumnoId({ nivel, year, alumnoId }: { nivel: Nivel; year: Year; alumnoId: string }) {
    return await mongoClient
      .db()
      .collection(`anotacionesRelevantes${nivel}${year}`)
      .findOne({ alumnoId: new ObjectId(alumnoId) })
  }
}
