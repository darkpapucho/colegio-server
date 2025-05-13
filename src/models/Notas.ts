import { ClientSession, ObjectId } from 'mongodb'

import { mongoClient } from '../db'
import { Nivel, Year } from '../types/enums'
export default class Notas {
  static async updateCursosFieldsByAlumnosId({ alumnosId, cursosKey, session, nivel, year }: { nivel: Nivel; year: Year; alumnosId: ObjectId[]; cursosKey: string[]; session?: ClientSession }) {
    const cursos = Object.fromEntries(cursosKey.map((curso) => [curso, [0, 0, 0, 0]]))

    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateMany({ alumnoId: { $in: alumnosId } }, { $set: { cursos } }, { session })

    return response
  }
}
