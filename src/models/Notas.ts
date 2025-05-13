import { ClientSession, ObjectId } from 'mongodb'

import { mongoClient } from '../db'
import { Nivel, Year } from '../types/enums'
export default class Notas {
  static async updateCursosFieldsByAlumnosId({ alumnosId, cursosKey, session, nivel, year }: { nivel: Nivel; year: Year; alumnosId: ObjectId[]; cursosKey: string[]; session?: ClientSession }) {
    const parsedCursos = Array.from(cursosKey, (curso): [string, [number, number, number, number]] => [curso, [0, 0, 0, 0]])
    const cursosMap = new Map<string, [number, number, number, number]>(parsedCursos)
    const cursos = Object.fromEntries(cursosMap)
    console.log({ cursos })
    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateMany({ alumnoId: { $in: alumnosId } }, { $set: { cursos } }, { session })
    console.log({ response12: response })
    return response
  }
}
