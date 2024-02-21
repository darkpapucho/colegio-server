import { EstadoMatricula, Grado, Seccion } from '../types/enums'
import { mongoClient } from '../db'
import { AMatriculado, AMatriculadoNoId, NuevoAlumno, PartialAlumno } from '../types/alumno'
import { ObjectId, WithId } from 'mongodb'
import { ErrorMessages } from '../error/enums'

export class Alumno {
  static async editarAlumno({ alumno, collectionName }: { alumno: PartialAlumno; collectionName: string }) {
    const { _id, ...data } = alumno
    const response = await mongoClient
      .db()
      .collection(collectionName)
      .updateOne({ _id: new ObjectId(_id) }, { $set: { ...data } })

    return response.acknowledged
  }
  //busca alumnos con estado de matricula no "TRASLADADO"
  static async buscarAlumno({ nombreCompleto, collectionName, estadosMatricula }: { nombreCompleto: string; collectionName: string; estadosMatricula: EstadoMatricula[] }): Promise<WithId<AMatriculadoNoId>[]> {
    let alumnos: WithId<AMatriculadoNoId>[] = []
    const cursor = mongoClient
      .db()
      .collection<AMatriculadoNoId>(collectionName)
      .find({ $text: { $search: nombreCompleto }, estadoMatricula: { $in: estadosMatricula } }, { sort: { grado: -1 } })
    for await (let doc of cursor) {
      alumnos.push(doc)
    }
    return alumnos
  }

  static async retirarAlumno({ _id, fechaRetiro, collectionName }: { _id: ObjectId; collectionName: string; fechaRetiro: string }): Promise<number> {
    const response = await mongoClient
      .db()
      .collection(collectionName)
      .updateOne({ _id, estadoMatricula: { $in: ['DEFINITIVA', 'PENDIENTE'] } }, { $set: { estadoMatricula: 'TRASLADADO', fechaRetiro } })
    return response.modifiedCount
  }

  static async getRatificarList({ grado, seccion, collectionName }: { grado: Grado; seccion: Seccion; collectionName: string }): Promise<WithId<AMatriculadoNoId>[]> {
    const cursor = mongoClient.db().collection<AMatriculadoNoId>(collectionName).find({ grado, seccion, estadoMatricula: 'DEFINITIVA' })
    const alumnos: WithId<AMatriculadoNoId>[] = []
    for await (let alumno of cursor) {
      alumnos.push(alumno)
    }
    return alumnos
  }

  static async ratificarMatricula({ alumnos, currentYearCollectionName, lastYearCollectionName }: { alumnos: AMatriculado[]; currentYearCollectionName: string; lastYearCollectionName: string }): Promise<void> {
    const alumnosNoId: AMatriculadoNoId[] = alumnos.map((alumno) => {
      const { _id, ...rest } = alumno
      return { ...rest }
    })
    const cantidadAlumnos = alumnos.length
    const alumnosIds: ObjectId[] = alumnos.map((alumno) => new ObjectId(alumno._id))
    const session = mongoClient.startSession()

    try {
      session.startTransaction()
      const response1 = await mongoClient
        .db()
        .collection(currentYearCollectionName)
        .insertMany([...alumnosNoId], { session })
      if (!response1.acknowledged || response1.insertedCount !== cantidadAlumnos) {
        throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
      }

      const response2 = await mongoClient
        .db()
        .collection(lastYearCollectionName)
        .deleteMany({ _id: { $in: alumnosIds } })
      if (!response2.acknowledged || response2.deletedCount !== cantidadAlumnos) {
        throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
      }

      session.commitTransaction()

      // for await(let alumno of alumnos){
      //   mongoClient.db().collection(lastYearCollectionName).deleteOne({_id:new ObjectId(alumno._id)})
      // }
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
    }
  }

  static async getByGradoSeccion({ grado, seccion, collectionName }: { grado: Grado; seccion: Seccion; collectionName: string }): Promise<WithId<AMatriculado>[]> {
    return new Promise(async (resolve) => {
      let alumnos: WithId<AMatriculado>[] = []
      const cursor = mongoClient.db().collection<AMatriculado>(collectionName).find({ grado, seccion })
      for await (const doc of cursor) {
        alumnos.push(doc)
      }
      resolve(alumnos)
    })
  }

  static async nuevaMatricula({ alumno, collectionName }: { alumno: NuevoAlumno; collectionName: string }): Promise<boolean> {
    return new Promise(async (resolve) => {
      const response = await mongoClient
        .db()
        .collection<AMatriculadoNoId>(collectionName)
        .insertOne({ ...alumno, nombreCompleto: alumno.apellidos + ', ' + alumno.nombres, estadoMatricula: 'PENDIENTE' })
      resolve(response.acknowledged)
    })
  }
}
