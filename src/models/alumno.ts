import { EstadoMatricula, Grado, Nivel, Seccion, Year } from '../types/enums'
import { mongoClient } from '../db'
import { AMatriculado, AMatriculadoNoId, AsistenciaRecord, AsistenciaValue, NuevoAlumno, PartialAlumno, Periodo } from '../types/alumno'
import { ClientSession, ObjectId, WithId } from 'mongodb'
import { ErrorMessages } from '../error/enums'
import { convertPeriodoKeyToIndex } from '../utils/generarBoletaNotas/utils/utils'
import { Month } from '../types/asistencia'
import Calendario from './Calendario'
import { parseMonthNameToMonthNumber1to12 } from '../vars/periodosDates'
import { PensionRecord } from '../types/pensiones'

export class Alumno {
  static async ProcesoNuevoMatricula({ nivel, year, alumno }: { nivel: Nivel; year: Year; alumno: NuevoAlumno }) {
    const session = mongoClient.startSession()
    session.startTransaction()
    try {
      const matriculaResult = await this.nuevaMatricula({ alumno, nivel, year, session })
      if (!matriculaResult.acknowledged || !matriculaResult.insertedId) {
        await session.abortTransaction()
        await session.endSession()
        return false
      }

      const lastDayFromCalendar = await Calendario.fetchLastDayOfCalendarioEscolar({ nivel, year })

      if (!lastDayFromCalendar) {
        await session.abortTransaction()
        await session.endSession()
        return false
      }
      const lastDate = new Date(`${year}-${parseMonthNameToMonthNumber1to12(lastDayFromCalendar.month)}-${lastDayFromCalendar.day}`)

      //insertar asistencia records de acuerdo a la fecha de la mtricula
      const fechaMatricula = new Date(alumno.fechaMatricula)

      const calendarioDaysForMatricula = await Calendario.getCalendarioDaysRange({ nivel, year, startDate: fechaMatricula, endDate: lastDate })

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
      //insertar pensiones de acuerdo a la fecha de matricula
      const pensiones = []
      for (let i = fechaMatricula.getMonth(); i <= 11; i++) {
        const record = { fecha: '', monto_pagar: nivel === 'primaria' ? 170 : 160, monto_pagado: 0, mes: i, pagado: false }
        pensiones.push(record)
      }
      const pensionesResponse = await mongoClient
        .db()
        .collection(`pensiones${nivel}${year}`)
        .insertOne({ numPensionesPagadas: 0, alumnoId: matriculaResult.insertedId, pensiones }, { session })
      if (!pensionesResponse.acknowledged || !pensionesResponse.insertedId) {
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

  static async increaseInasistenciaJustificadaAlumno({
    nivel,
    year,
    alumnoId,
    periodo,
    quantity,
  }: {
    quantity: number
    nivel: Nivel
    year: Year
    periodo: Periodo
    alumnoId: string
  }) {
    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $inc: { [`inasistencias.justificadas.${convertPeriodoKeyToIndex(periodo)}`]: quantity } })
    return response
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
    // console.log({ quantity, nivel, year, alumnoId, periodo })
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
  static async fetchAlumnosIdsByGradoSeccion({
    nivel,
    year,
    grado,
    seccion,
    estadoMatricula,
  }: {
    estadoMatricula?: EstadoMatricula
    nivel: Nivel
    year: Year
    grado: Grado
    seccion: Seccion
  }) {
    const cursor = await mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .distinct('_id', { grado, seccion, estadoMatricula: { $in: estadoMatricula ? [...estadoMatricula] : ['DEFINITIVA', 'EN PROCESO', 'PENDIENTE'] } })
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
    sourceNivel,
    targetNivel,
    currentYear,
    lastYear,
    fechaMatricula,
  }: {
    fechaMatricula: Date
    alumnos: AMatriculado[]
    targetNivel: Nivel
    sourceNivel: Nivel
    currentYear: Year
    lastYear: Year
  }): Promise<void> {
    const alumnosNoId: AMatriculadoNoId[] = alumnos.map((alumno) => {
      const { _id, ...rest } = alumno
      return { ...rest }
    })
    const cantidadAlumnos = alumnos.length
    const oldAlumnosIds: ObjectId[] = alumnos.map((alumno) => new ObjectId(alumno._id)) //old ids

    const session = mongoClient.startSession()

    session.startTransaction()
    //matricular en el año presente:
    const matriculaResult = await mongoClient
      .db()
      .collection(`matriculados${targetNivel}${currentYear}`)
      .insertMany([...alumnosNoId], { session })
    if (!matriculaResult.acknowledged || matriculaResult.insertedCount !== cantidadAlumnos) {
      await session.abortTransaction()
      await session.endSession()
      throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
    }
    const newAlumnosIds = Object.values(matriculaResult.insertedIds)

    //borrar de la lista ratificar del año pasado
    const deleteResult = await mongoClient
      .db()
      .collection(`ratificar${sourceNivel}${lastYear}`)
      .deleteMany({ _id: { $in: oldAlumnosIds } })

    if (!deleteResult.acknowledged || deleteResult.deletedCount !== cantidadAlumnos) {
      await session.abortTransaction()
      await session.endSession()
      throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
    }

    //asistencia:
    let alumnoAsistenciaRecords: AsistenciaRecord[] = []
    const lastDayFromCalendar = await Calendario.fetchLastDayOfCalendarioEscolar({ nivel: targetNivel, year: currentYear })
    // if (!lastDayFromCalendar) {
    //   await session.abortTransaction()
    //   await session.endSession()

    // }

    if (lastDayFromCalendar != null) {
      const lastDate = new Date(`${currentYear}-${parseMonthNameToMonthNumber1to12(lastDayFromCalendar.month)}-${lastDayFromCalendar.day}`)
      const calendarioDaysForMatricula = await Calendario.getCalendarioDaysRange({ nivel: targetNivel, year: currentYear, startDate: fechaMatricula, endDate: lastDate })
      alumnoAsistenciaRecords = calendarioDaysForMatricula.map((element) => {
        return { dayId: element._id, day: element.day, month: element.month, asistencia: '', modified: '' }
      })
    }
    const recordsAsistencia = newAlumnosIds.map((alumnoId) => {
      return { alumnoId, records: alumnoAsistenciaRecords }
    })

    const asistenciasResponse = await Calendario.insertManyAlumnoAsistenciaRecord({ nivel: targetNivel, year: currentYear, recordsAsistencia, session })
    if (asistenciasResponse.insertedCount != cantidadAlumnos) {
      await session.abortTransaction()
      await session.endSession()
      throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
    }
    //notas: manejado por un trigger de la base de datos

    //pensiones
    const pensiones: PensionRecord[] = []
    for (let i = fechaMatricula.getMonth(); i <= 11; i++) {
      const record = { fecha: '', monto_pagar: targetNivel === 'primaria' ? 170 : 160, monto_pagado: 0, mes: i, pagado: false }
      pensiones.push(record)
    }
    const recordsPensiones = newAlumnosIds.map((alumnoId) => {
      return { alumnoId, pensiones, numPensionesPagadas: 0 }
    })

    const pensionesResponse = await mongoClient
      .db()
      .collection(`pensiones${targetNivel}${currentYear}`)
      .insertMany([...recordsPensiones], { session })
    if (pensionesResponse.insertedCount != cantidadAlumnos) {
      await session.abortTransaction()
      await session.endSession()
      throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
    }

    await session.commitTransaction()
    await session.endSession()
  }

  static async getByGradoSeccion({
    nivel,
    year,
    grado,
    seccion,
    estadosMatricula,
  }: {
    estadosMatricula?: EstadoMatricula[]
    nivel: Nivel
    year: Year
    grado: Grado
    seccion: Seccion
  }): Promise<WithId<AMatriculado>[]> {
    return new Promise(async (resolve) => {
      let alumnos: WithId<AMatriculado>[] = []

      const cursor = mongoClient
        .db()
        .collection<AMatriculado>(`matriculados${nivel}${year}`)
        .find({ grado, seccion, estadoMatricula: { $in: estadosMatricula ? [...estadosMatricula] : ['DEFINITIVA', 'EN PROCESO'] } })
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
    const alumno = await mongoClient.db().collection<AMatriculadoNoId>(`matriculados${nivel}${year}`).findOne({ dni })
    return alumno
  }
  static async fetchAlumnoByGradoSeccionApellidos({ nivel, year, apellidos, grado, seccion }: { nivel: Nivel; year: Year; apellidos: string; grado: Grado; seccion: Seccion }) {
    const alumno = await mongoClient.db().collection<AMatriculadoNoId>(`matriculados${nivel}${year}`).findOne({ apellidos, grado, seccion })
    return alumno
  }
  static async fetchAlumnoByCodigoEstudiante({ nivel, year, codigoEstudiante }: { nivel: Nivel; year: Year; codigoEstudiante: string }) {
    const alumno = await mongoClient.db().collection<AMatriculadoNoId>(`matriculados${nivel}${year}`).findOne({ codigoEstudiante })
    return alumno
  }
  static async getById({ nivel, year, id }: { nivel: Nivel; year: Year; id: string }) {
    const response = await mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .findOne<AMatriculado>({ _id: new ObjectId(id) })
    return response
  }
}
