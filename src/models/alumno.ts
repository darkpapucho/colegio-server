import { EstadoMatricula, Grado, Nivel, Seccion, Year } from '../types/enums'
import { mongoClient } from '../db'
import { AMatriculado, AMatriculadoNoId, AsistenciaRecord, AsistenciaValue, NuevoAlumno, PartialAlumno, Periodo } from '../types/alumno'
import { ClientSession, ObjectId, WithId } from 'mongodb'
import { ErrorMessages } from '../error/enums'
import { convertPeriodoKeyToIndex } from '../utils/generarBoletaNotas/utils/utils'
import { Month } from '../types/asistencia'
import Calendario from './Calendario'

export class Alumno {
  static async ProcesoNuevoMatricula({ nivel, year, alumno }: { nivel: Nivel; year: Year; alumno: NuevoAlumno }) {
    const session = mongoClient.startSession()
    session.startTransaction()

    try {
      const matriculaResult = await this.nuevaMatricula({ alumno, nivel, year, session })
      if (!matriculaResult.acknowledged) {
        await session.abortTransaction()
        await session.endSession()
        return false
      }
      const lastDayFromCalendar = await Calendario.fetchLasyDayOfCalendarioEscolar({ nivel, year })
      const lastDate = new Date(`${lastDayFromCalendar.month}-${lastDayFromCalendar.day}-${year}`)
      //insertar asistencia records de acuerdo a la fecha de la mtricula
      const calendarioDaysForMatricula = await Calendario.getCalendarioDaysForNewMatricula({ nivel, year, fechaMatricula: new Date(alumno.fechaMatricula), lastDate })
      //insertar nuevo record en asistencias{nivel}{year}
      const alumnoAsistenciaRecords: AsistenciaRecord[] = calendarioDaysForMatricula.map((element) => {
        return { dayId: element._id, day: element.day, month: element.month, asistencia: '', modified: '' }
      })
      const result2 = await Calendario.insertNewMatriculaRecordAsistenciaEscolar({ nivel, year, alumnoId: matriculaResult.insertedId, records: alumnoAsistenciaRecords })
      if (!result2.acknowledged) {
        await session.abortTransaction()
        await session.endSession()
        return false
      }
      await session.commitTransaction()
      await session.endSession()
      return true
    } catch (error) {
      await session.abortTransaction()
      await session.endSession()
      return false
    }
  }
  static async fetchAsistenciaList({ grado, seccion, nivel, year, month, dayId }: { dayId: string; month: Month; grado: Grado; seccion: Seccion; nivel: Nivel; year: Year }) {
    const asistenciasCollection = `asistencias${nivel}${year}`
    const matriculadosCollection = `matriculados${nivel}${year}`

    return new Promise(async (resolve) => {
      let asistenciaList: { nombreCompleto: string; alumnoId: ObjectId; asistencia: AsistenciaValue }[] = []
      const cursor = mongoClient
        .db()
        .collection(matriculadosCollection)
        .aggregate<{ nombreCompleto: string; alumnoId: ObjectId; asistencia: AsistenciaValue }>([
          { $match: { grado, seccion, estadoMatricula: { $in: ['DEFINITIVA', 'EN PROCESO'] } } },
          { $lookup: { from: asistenciasCollection, localField: '_id', foreignField: 'alumnoId', as: 'asistencia' } },
          { $project: { nombreCompleto: 1, _id: 0, recordAsistencia: { $arrayElemAt: ['$asistencia', 0] } } },
          { $project: { nombreCompleto: 1, alumnoId: '$recordAsistencia.alumnoId', records: `$recordAsistencia.records` } },
          { $project: { nombreCompleto: 1, alumnoId: 1, records: { $filter: { input: '$records', as: 'records', cond: { $eq: ['$$records.dayId', new ObjectId(dayId)] } } } } },
          { $project: { nombreCompleto: 1, alumnoId: 1, asistencia: { $arrayElemAt: ['$records', 0] } } },
          { $project: { alumnoId: 1, nombreCompleto: 1, asistencia: '$asistencia.asistencia' } },
          { $sort: { nombreCompleto: 1 } },
        ])

      for await (let doc of cursor) {
        asistenciaList.push(doc)
      }

      resolve({ asistenciaList, dayId, month })
    })
  }

  static async increaseInasistenciaInjustificadaAlumno({
    nivel,
    year,
    alumnoId,
    periodo,
    quantity,
  }: {
    quantity: number
    nivel: Nivel
    year: Year
    alumnoId: string
    periodo: Periodo
  }) {
    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $inc: { [`inasistencias.injustificadas.${convertPeriodoKeyToIndex(periodo)}`]: quantity } })
    return response
  }
  static async increaseTardanzaInjustificadaAlumno({
    nivel,
    year,
    alumnoId,
    periodo,
    quantity,
  }: {
    quantity: number
    nivel: Nivel
    year: Year
    alumnoId: string
    periodo: Periodo
  }) {
    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $inc: { [`tardanzas.injustificadas.${convertPeriodoKeyToIndex(periodo)}`]: quantity } })
    return response
  }
  // static async updateAsistenciaList({ nivel, year, asistenciaList }: { nivel: Nivel; year: Year; asistenciaList: AsistenciaList }) {
  //   const { list, dayId, periodo } = asistenciaList
  //   console.log({ list, dayId, periodo })
  //   const asistenciasCollection = mongoClient.db().collection(`asistencias${nivel}${year}`)
  //   list.forEach(async (record) => {
  //     //only process F and A values, ingore T because they dont have to be addressed here.
  //     if (record.asistencia === 'F') {
  //       //increase inasistencias.injustificadas by 1 in "notas collection"
  //       const key = `inasistencias.injustificadas.${convertPeriodoKeyToIndex(periodo)}`
  //       await mongoClient
  //         .db()
  //         .collection(`notas${nivel}${year}`)
  //         .updateOne({ alumnoId: new ObjectId(record.alumnoId) }, { $inc: { [key]: 1 } })
  //     }
  //     /////
  //     if (record.asistencia !== 'T') {
  //       await asistenciasCollection.updateOne(
  //         { alumnoId: new ObjectId(record.alumnoId) },
  //         { $set: { 'records.$[element].asistencia': record.asistencia } },
  //         { arrayFilters: [{ 'element.dayId': new ObjectId(dayId) }] },
  //       )
  //     }
  //   })
  // }
  static async fetchAlumnosIdsByGradoSeccion({ nivel, year, grado, seccion }: { nivel: Nivel; year: Year; grado: Grado; seccion: Seccion }) {
    const cursor = await mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .distinct('_id', { grado, seccion, estadoMatricula: { $in: ['DEFINITIVA', 'EN PROCESO', 'PENDIENTE'] } })
    const records = []
    for await (const doc of cursor) {
      records.push(doc)
    }
    return records
  }
  static async editarAlumno({ alumno, collectionName }: { alumno: PartialAlumno; collectionName: string }) {
    const { _id, ...data } = alumno
    const response = await mongoClient
      .db()
      .collection(collectionName)
      .updateOne({ _id: new ObjectId(_id) }, { $set: { ...data } })

    return response.acknowledged
  }
  //busca alumnos con estado de matricula no "TRASLADADO"
  static async buscarAlumno({
    nombreCompleto,
    collectionName,
    estadosMatricula,
  }: {
    nombreCompleto: string
    collectionName: string
    estadosMatricula: EstadoMatricula[]
  }): Promise<WithId<AMatriculadoNoId>[]> {
    let alumnos: WithId<AMatriculadoNoId>[] = []
    const cursor = mongoClient
      .db()
      .collection<AMatriculadoNoId>(collectionName)
      .find({ $text: { $search: nombreCompleto }, estadoMatricula: { $in: [...estadosMatricula] } }, { sort: { grado: -1 } })
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

  static async ratificarMatricula({
    alumnos,
    currentYearCollectionName,
    lastYearCollectionName,
  }: {
    alumnos: AMatriculado[]
    currentYearCollectionName: string
    lastYearCollectionName: string
  }): Promise<void> {
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

  static async nuevaMatricula({ alumno, nivel, year, session }: { session?: ClientSession; alumno: NuevoAlumno; nivel: Nivel; year: Year }) {
    const response = await mongoClient
      .db()
      .collection<AMatriculadoNoId>(`matriculados${nivel}${year}`)
      .insertOne({ ...alumno, nombreCompleto: alumno.apellidos + ', ' + alumno.nombres, estadoMatricula: 'DEFINITIVA' }, { session: session ? session : undefined })
    return response
  }

  static async fetchAlumnoByDni({ nivel, year, dni }: { nivel: Nivel; year: Year; dni: string }) {
    const alumno = await mongoClient.db().collection(`matriculados${nivel}${year}`).findOne({ dni })
    return alumno
  }
}
