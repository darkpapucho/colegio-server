import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'
import { Nivel, Year } from '../types/enums'
import { CalendarioDay, Month } from '../types/asistencia'
import { EnableDayList } from '../types/calendario'
import { ErrorMessages } from '../error/enums'
import { convertPeriodoKeyToIndex } from '../utils/generarBoletaNotas/utils/utils'
import { AsistenciaValue, Periodo } from '../types/alumno'

export default class Calendario {
  static async setAsistenciaAlumnoDay({ nivel, year, alumnoId, dayId, asistencia }: { nivel: Nivel; year: Year; alumnoId: string; dayId: string; asistencia: AsistenciaValue }) {
    const response = await mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $set: { 'records.$[element].asistencia': asistencia } }, { arrayFilters: [{ 'element.dayId': new ObjectId(dayId) }] })
    return response
  }
  static async setCurrentPeriodo({ nivel, year, periodo }: { nivel: Nivel; periodo: Periodo; year: Year }) {
    await mongoClient
      .db()
      .collection('currentPeriodo')
      .updateOne({ nivel, year: Number(year) }, { $set: { periodo } }, { upsert: true })
  }
  static async fetchCurrentPeriodo({ nivel, year }: { nivel: Nivel; year: Year }) {
    const response = await mongoClient
      .db()
      .collection<WithId<{ nivel: Nivel; year: number; periodo: Periodo }>>('currentPeriodo')
      .findOne({ nivel, year: Number(year) })
    return response
  }
  static async fetchADayAsistenciaRecord({ nivel, year, alumnoId, dayId }: { nivel: Nivel; year: Year; alumnoId: string; dayId: string }) {
    const cursor = mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .aggregate<{ _id: ObjectId; alumnoId: ObjectId; records: { dayId: ObjectId; asistencia: AsistenciaValue; day: number; month: Month; issuer: ObjectId } }>([
        { $match: { alumnoId: new ObjectId(alumnoId) } },
        { $unwind: { path: '$records' } },
        { $match: { 'records.dayId': new ObjectId(dayId) } },
      ])
    const results: { _id: ObjectId; alumnoId: ObjectId; records: { dayId: ObjectId; asistencia: AsistenciaValue; day: number; month: Month; issuer: ObjectId } }[] = []
    for await (let doc of cursor) {
      results.push(doc)
    }
    return results
  }

  static async fetchDayId({ day, month, nivel, year }: { day: number; month: Month; nivel: Nivel; year: Year }) {
    return await mongoClient
      .db()
      .collection(`calendario${nivel}${year}`)
      .findOne({ day, month }, { projection: { _id: 1 } })
  }

  static async reportTardanzaAlumno({ nivel, year, alumnoId, dayId, issuer }: { issuer: string; nivel: Nivel; year: Year; alumnoId: string; dayId: string }) {
    const session = mongoClient.startSession()
    session.startTransaction()
    const response1 = await mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .updateOne(
        { alumnoId: new ObjectId(alumnoId), 'records.dayId': new ObjectId(dayId) },
        { $set: { 'records.$.asistencia': 'T', 'records.$.issuer': new ObjectId(issuer), 'records.$.modified': new Date() } },
      )

    if (!response1.acknowledged || !response1.modifiedCount) {
      await session.abortTransaction()
      session.endSession()
      throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
    }

    const response2 = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $inc: { [`tardanzas.injustificadas.${convertPeriodoKeyToIndex('primerPeriodo')}`]: 1 } })

    if (!response2.acknowledged || !response2.modifiedCount) {
      await session.abortTransaction()
      session.endSession()
      throw new Error(ErrorMessages.OPERATION_NOT_COMPLETED)
    }

    await session.commitTransaction()
    session.endSession()
  }

  static async deleteDayFromCalendar({ nivel, year, dayId }: { nivel: Nivel; year: Year; dayId: string }) {
    const response = await mongoClient
      .db()
      .collection(`calendario${nivel}${year}`)
      .deleteOne({ _id: new ObjectId(dayId) })
    return response
  }

  static async fetchCalendario({ nivel, year }: { nivel: Nivel; year: Year }) {
    const cursor = mongoClient.db().collection(`calendario${nivel}${year}`).find({}).sort('month', 1)
    const documents = []
    for await (let doc of cursor) {
      documents.push(doc)
    }
    return documents
  }

  static async checkSalonDayStatus({ dayId, nivel, year }: { dayId: string; nivel: Nivel; year: Year }) {
    const collection = mongoClient.db().collection<WithId<CalendarioDay>>(`calendario${nivel}${year}`)
    const response = await collection.findOne({ _id: new ObjectId(dayId) }, { projection: { status: 1 } })
    return response
  }

  static async checkSalonDayStatusByMonthDay({ nivel, year, day, month }: { nivel: Nivel; year: Year; day: number; month: Month }) {
    return await mongoClient.db().collection<WithId<CalendarioDay>>(`calendario${nivel}${year}`).findOne({ day, month })
  }

  static async enableCalendarDays({ nivel, year, daysList }: { nivel: Nivel; year: Year; daysList: EnableDayList }) {
    const collection = mongoClient.db().collection(`calendario${nivel}${year}`)
    const currentTime = new Date()
    const modifiedList = daysList.map((record) => {
      return { ...record, status: 'disabled', createdAt: currentTime } //removed salones:[]
    })
    modifiedList.forEach(async (record) => {
      await collection.updateOne({ month: record.month, day: record.day }, { $set: { ...record } }, { upsert: true })
    })
  }
}
