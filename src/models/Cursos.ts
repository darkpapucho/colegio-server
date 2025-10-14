import { mongoClient } from '../db'
import { Grado, Nivel, Seccion, Year } from '../types/enums'
import { CURSO_SALON } from '../types/cursos'
import { ClientSession } from 'mongodb'

export default class Cursos {
  static async updateCursosSalon({
    nivel,
    year,
    cursos,
    grado,
    seccion,
    session,
  }: {
    nivel: Nivel
    year: Year
    cursos: CURSO_SALON[]
    grado: Grado
    seccion: Seccion
    session?: ClientSession
  }) {
    const response = await mongoClient.db().collection(`cursos${nivel}${year}`).updateOne({ grado, seccion }, { $set: { cursos } }, { upsert: true, session })
    return response
  }
  static async getCursosSalon({ nivel, year, grado, seccion }: { nivel: Nivel; grado: Grado; seccion: Seccion; year: Year }) {
    const response = await mongoClient
      .db()
      .collection(`cursos${nivel}${year}`)
      .findOne<{ cursos: CURSO_SALON[] }>({ grado, seccion }, { projection: { cursos: 1, _id: 0 } })

    return response
  }
}
