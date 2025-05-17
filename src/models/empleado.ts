import { Grado, Nivel, Seccion, Year } from '../types/enums'
import { mongoClient } from '../db'
import { ClientSession, ObjectId } from 'mongodb'
import { ProfesorData } from '../types/user'
import { Profesor } from '../types/empleado'
import { hashPassword } from '../utils/hashPassword'
import { Curso, SalonProfesor } from '../types/salon'
import { HorarioProfesorCell } from '../types/horarioProfesor'

export default class Empleado {
  static async findTutorByGradoSeccion({ nivel, year, grado, seccion }: { nivel: Nivel; year: Year; grado: Grado; seccion: Seccion }) {
    const cursor = mongoClient
      .db()
      .collection(`empleados${nivel}${year}`)
      .aggregate<{ nombreCompleto: string; salon: SalonProfesor }>([
        {
          $match: { rol: 'profesor' },
        },
        {
          $project: {
            nombres: 1,
            apellidos: 1,
            salones: { $filter: { input: '$salones', as: 'salon', cond: { $and: [{ $eq: ['$$salon.label', `${grado} ${seccion}`] }, { $eq: ['$$salon.tutor', true] }] } } },
          },
        },
        {
          $project: {
            _id: 0,
            nombreCompleto: { $concat: ['$apellidos', ', ', '$nombres'] },
            salon: { $arrayElemAt: ['$salones', 0] },
          },
        },
        { $match: { salon: { $exists: true, $ne: null } } },
      ])
    const result = []
    for await (const doc of cursor) {
      result.push(doc)
    }

    return result[0]
  }
  static async deleteAnuncioProfesor({ nivel, year, anuncioId, profesorId }: { profesorId: string; nivel: Nivel; year: Year; anuncioId: string }) {
    const response = await mongoClient
      .db()
      .collection(`empleados${nivel}${year}`)
      .updateOne({ _id: new ObjectId(profesorId) }, { $pull: { anuncios: { _id: new ObjectId(anuncioId) } } })
    return response
  }
  static async agregarAnuncioProfesor({
    salones,
    nivel,
    year,
    content,
    title,
    date,
    profesorId,
  }: {
    nivel: Nivel
    year: Year
    content: string
    title: string
    profesorId: string
    date: string
    salones: string[]
  }) {
    const anuncioId = new ObjectId()
    await mongoClient
      .db()
      .collection(`empleados${nivel}${year}`)
      .updateOne({ _id: new ObjectId(profesorId) }, { $push: { anuncios: { content, title, date, _id: anuncioId, salones } } })
    return anuncioId
  }
  static async deleteHorarioCell({
    nivel,
    year,
    startTime,
    endTime,
    curso,
    salon,
    profesorId,
  }: {
    nivel: Nivel
    year: Year
    startTime: string
    endTime: string
    curso: string
    salon: string
    profesorId: string
  }) {
    const response = await mongoClient
      .db()
      .collection(`empleados${nivel}${year}`)
      .updateOne({ _id: new ObjectId(profesorId) }, { $pull: { horario: { startTime, endTime, curso, salon } } })
    return response
  }
  static async fetchProfesorHorario({ nivel, year, profesorId }: { nivel: Nivel; year: Year; profesorId: string }) {
    const response = await mongoClient
      .db()
      .collection(`empleados${nivel}${year}`)
      .findOne<{ horario: HorarioProfesorCell[] }>({ _id: new ObjectId(profesorId) }, { projection: { horario: 1, _id: 0 } })
    return response
  }

  static async agregarHorarioCell({
    startTime,
    endTime,
    profesorId,
    curso,
    salon,
    nivel,
    year,
  }: {
    profesorId: string
    nivel: Nivel
    year: Year
    endTime: string
    curso: Curso
    salon: string
    startTime: string
  }) {
    const response = mongoClient
      .db()
      .collection(`empleados${nivel}${year}`)
      .updateOne({ _id: new ObjectId(profesorId) }, { $push: { horario: { startTime, endTime, curso, salon } } })

    return response
  }
  static async deleteProfesor({ nivel, year, userId }: { nivel: Nivel; year: Year; userId: string }) {
    const response = await mongoClient
      .db()
      .collection(`empleados${nivel}${year}`)
      .deleteOne({ userId: new ObjectId(userId) })
    return response
  }
  static async updateProfesorPassword({ newPassword, userId, nivel }: { nivel: Nivel; userId: string; newPassword: string }) {
    const hashedPass = await hashPassword(newPassword)
    const response = await mongoClient
      .db()
      .collection(`users${nivel}`)
      .updateOne({ _id: new ObjectId(userId) }, { $set: { password: hashedPass } })
    return response
  }
  static async updateProfesor({ nivel, year, profesor }: { nivel: Nivel; year: Year; profesor: Profesor }) {
    const { _id, userId, ...rest } = profesor
    const collectionName = `empleados${nivel}${year}`
    const response = await mongoClient
      .db()
      .collection(collectionName)
      .updateOne({ _id: new ObjectId(_id) }, { $set: { ...rest } })
    return response
  }
  static async crearProfesor({ nivel, year, newProfesor, session }: { session?: ClientSession; nivel: Nivel; year: Year; newProfesor: ProfesorData }) {
    const empleadosCollection = `empleados${nivel}${year}`
    const response = mongoClient
      .db()
      .collection(empleadosCollection)
      .insertOne({ ...newProfesor, userId: new ObjectId(newProfesor.userId) }, { session })
    return response
  }
  static async fetchProfesores({ nivel, year }: { nivel: Nivel; year: Year }) {
    const collectionName = `empleados${nivel}${year}`
    const cursor = mongoClient.db().collection<Profesor>(collectionName).find({ rol: 'profesor' })
    const profesores: Profesor[] = []
    for await (const doc of cursor) {
      profesores.push(doc)
    }
    return profesores
  }
}
