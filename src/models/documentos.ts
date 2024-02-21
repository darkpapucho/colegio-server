import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'

import { Grado, Nivel, Seccion, Year } from '../types/enums'
import { ExtendedRegistroNota, RegistroNota } from '../types/documents'

export default class Documento {
  static async getRegistrosByGradoSeccion({ nivel, year, grado, seccion }: { nivel: Nivel; year: Year; grado: Grado; seccion: Seccion }) {
    const cursor = mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .aggregate<ExtendedRegistroNota>([
        {
          $lookup: {
            from: `matriculados${nivel}${year}`,
            localField: 'alumnoId',
            foreignField: '_id',
            as: 'estudiante',
          },
        },
        {
          $match: {
            'estudiante.grado': grado,
            'estudiante.seccion': seccion,
          },
        },
      ])
    let registros: ExtendedRegistroNota[] = []
    await cursor.forEach((element) => {
      registros.push(element)
    })
    return registros
  }

  static async updateRegistroNotas({ collectionName, registro }: { collectionName: string; registro: RegistroNota[] }) {
    for (const record of registro) {
      const { tardanzas, inasistencias, conclusionesDescriptivas, cursos } = record
      await mongoClient
        .db()
        .collection(collectionName)
        .updateOne({ alumnoId: new ObjectId(record.alumnoId) }, { $set: { tardanzas, inasistencias, conclusionesDescriptivas, cursos } })
    }
  }

  static async fetchRegistroNotasBySalon({ nivel, year, alumnosIds }: { nivel: Nivel; year: Year; alumnosIds: ObjectId[] }) {
    const notasCollection = `notas${nivel}${year}`
    const alumnosCollection = `matriculados${nivel}${year}`
    const registroNotas: RegistroNota[] = []

    const registrosCursos = mongoClient
      .db()
      .collection(notasCollection)
      .aggregate<RegistroNota>([
        { $match: { alumnoId: { $in: alumnosIds } } },
        {
          $lookup: {
            from: alumnosCollection,
            localField: 'alumnoId',
            foreignField: '_id',
            as: 'estudiante',
          },
        },
        {
          $project: {
            _id: 0,
            alumnoId: 1,
            educando: { $arrayElemAt: ['$estudiante', 0] },
            tardanzas: 1,
            inasistencias: 1,
            conclusionesDescriptivas: 1,
            cursos: 1,
          },
        },
        {
          $project: {
            alumnoId: 1,
            nombres: '$educando.nombres',
            apellidos: '$educando.apellidos',
            estadoMatricula: '$educando.estadoMatricula',
            grado: '$educando.grado',
            seccion: '$educando.seccion',
            tardanzas: 1,
            inasistencias: 1,
            conclusionesDescriptivas: 1,
            cursos: 1,
          },
        },
      ])

    for await (const registro of registrosCursos) {
      registroNotas.push(registro)
    }
    // await notasCursor.forEach((registro) => {
    //   registroNotas.push(registro)
    // })
    return registroNotas
  }

  static async fetchNumeroResolucion(collectionName: string): Promise<number> {
    const response = await mongoClient.db().collection<WithId<{ count: number }>>(collectionName).findOne({})
    if (!response) {
      await mongoClient.db().collection(collectionName).insertOne({ count: 1 })
      return 1
    }
    return response.count
  }
  static async increaseNumeroResolucion(collectionName: string) {
    await mongoClient
      .db()
      .collection(collectionName)
      .updateOne({}, { $inc: { count: 1 } })
  }
}
