import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'

import { Grado, Nivel, Seccion, Year } from '../types/enums'
import { CursoNotaRecord, ExtendedRegistroNota, RegistroNota } from '../types/documents'
import { SalonProfesor } from '../types/user'

export default class Documento {
  static async updateRegistroNotasProfesor({ nivel, year, isTutor, registro }: { registro: RegistroNota[]; isTutor: boolean; nivel: Nivel; year: Year }) {
    const collection = mongoClient.db().collection(`notas${nivel}${year}`)
    if (isTutor) {
      for (const record of registro) {
        const { tardanzas, inasistencias, conclusionesDescriptivas, cursos } = record
        const cursosKeys = Object.keys(cursos)
        const notas: { [key: string]: CursoNotaRecord } = {}
        cursosKeys
          .map((cursoKey) => {
            return { [`cursos.${cursoKey}`]: cursos[cursoKey] }
          })
          .forEach((element) => {
            notas[Object.keys(element)[0]] = Object.values(element)[0]
          })

        await collection.updateOne({ alumnoId: new ObjectId(record.alumnoId) }, { $set: { tardanzas, inasistencias, conclusionesDescriptivas, ...notas } })
      }
    } else {
      for (const record of registro) {
        const { cursos } = record
        const cursosKeys = Object.keys(cursos)
        const notas: { [key: string]: CursoNotaRecord } = {}
        cursosKeys
          .map((cursoKey) => {
            return { [`cursos.${cursoKey}`]: cursos[cursoKey] }
          })
          .forEach((element) => {
            notas[Object.keys(element)[0]] = Object.values(element)[0]
          })

        await collection.updateOne({ alumnoId: new ObjectId(record.alumnoId) }, { $set: { ...notas } })
      }
    }
  }

  static async fetchNotasPorAlumnosYCursos({ nivel, year, alumnosIdsList, salon }: { salon: SalonProfesor; nivel: Nivel; year: Year; alumnosIdsList: ObjectId[] }) {
    const notasCollection = mongoClient.db().collection(`notas${nivel}${year}`)

    const cursosList: { [key: string]: 1 } = {}
    salon.cursos.forEach((curso) => {
      cursosList[curso.key] = 1
    })
    if (salon.tutor) {
      const cursor = notasCollection.aggregate([
        { $match: { alumnoId: { $in: alumnosIdsList } } },
        {
          $lookup: {
            from: `matriculados${nivel}${year}`,
            localField: 'alumnoId',
            foreignField: '_id',
            as: 'estudiante',
          },
        },
        {
          $project: {
            _id: 0,
            alumnoId: 1,
            tardanzas: 1,
            inasistencias: 1,
            conclusionesDescriptivas: 1,
            cursos: 1,
            educando: { $arrayElemAt: ['$estudiante', 0] },
          },
        },
        {
          $project: {
            alumnoId: 1,
            tardanzas: 1,
            inasistencias: 1,
            conclusionesDescriptivas: 1,
            cursos: { ...cursosList },
            nombres: '$educando.nombres',
            apellidos: '$educando.apellidos',
          },
        },
      ])
      const records = []
      for await (const doc of cursor) {
        records.push(doc)
      }

      return records
    } else {
      const cursor = notasCollection.aggregate([
        { $match: { alumnoId: { $in: alumnosIdsList } } },
        {
          $lookup: {
            from: `matriculados${nivel}${year}`,
            localField: 'alumnoId',
            foreignField: '_id',
            as: 'estudiante',
          },
        },
        {
          $project: {
            _id: 0,
            alumnoId: 1,
            cursos: 1,
            educando: { $arrayElemAt: ['$estudiante', 0] },
          },
        },
        {
          $project: {
            alumnoId: 1,
            cursos: { ...cursosList },
            nombres: '$educando.nombres',
            apellidos: '$educando.apellidos',
          },
        },
      ])
      const records = []
      for await (const doc of cursor) {
        records.push(doc)
      }

      return records
    }
  }

  static async getRecordNotasAlumno({ alumnoId, nivel, year }: { nivel: Nivel; year: Year; alumnoId: string }) {
    const notasCollection = `notas${nivel}${year}`
    const alumnosCollection = `matriculados${nivel}${year}`
    const cursor = mongoClient
      .db()
      .collection(notasCollection)
      .aggregate<ExtendedRegistroNota>([
        { $match: { alumnoId: new ObjectId(alumnoId) } },
        { $lookup: { from: alumnosCollection, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
        { $project: { _id: 0, alumnoId: 1, estudiante: 1, tardanzas: 1, inasistencias: 1, conclusionesDescriptivas: 1, cursos: 1 } },
      ])
    let registros: ExtendedRegistroNota[] = []
    for await (const registro of cursor) {
      registros.push(registro)
    }
    return registros
  }
  static async getRegistrosByGradoSeccion({ nivel, year, grado, seccion }: { nivel: Nivel; year: Year; grado: Grado; seccion: Seccion }) {
    const notasCollection = `notas${nivel}${year}`
    const alumnosCollection = `matriculados${nivel}${year}`
    const cursor = mongoClient
      .db()
      .collection(notasCollection)
      .aggregate<ExtendedRegistroNota>([
        {
          $lookup: {
            from: alumnosCollection,
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
        .updateOne({ alumnoId: new ObjectId(record.alumnoId) }, { $set: { tardanzas, inasistencias, conclusionesDescriptivas, cursos: { ...cursos } } })
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
