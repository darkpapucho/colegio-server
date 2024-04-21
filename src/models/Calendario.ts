import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'
import { Nivel, Year } from '../types/enums'

import { CalendarioDay, Month } from '../types/asistencia'
import { EnableDayList } from '../types/calendario'

export default class Calendario {
  static async fetchDayId({ day, month, nivel, year }: { day: number; month: Month; nivel: Nivel; year: Year }) {
    return await mongoClient
      .db()
      .collection(`calendario${nivel}${year}`)
      .findOne({ day, month }, { projection: { _id: 1 } })
  }
  static async reportTardanzaAlumno({ nivel, year, alumnoId, dayId, month, issuer }: { issuer: string; month: Month; nivel: Nivel; year: Year; alumnoId: string; dayId: string }) {
    console.log({ nivel, year, dayId, month, issuer, alumnoId })
    return await mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .updateOne(
        { alumnoId: new ObjectId(alumnoId), [`${month}.dayId`]: new ObjectId(dayId) },
        { $set: { [`${month}.$.asistencia`]: 'T', [`${month}.$.issuer`]: new ObjectId(issuer), modified: new Date() } },
      )
  }
  static async deleteDayFromCalendar({ nivel, year, dayId, month }: { month: Month; nivel: Nivel; year: Year; dayId: string }) {
    const response = await mongoClient
      .db()
      .collection(`calendario${nivel}${year}`)
      .deleteOne({ _id: new ObjectId(dayId) })

    mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      //@ts-ignore
      .updateMany({}, { $pull: { [month]: { dayId: new ObjectId(dayId) } } })
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
    console.log({ daysList })
    const collection = mongoClient.db().collection(`calendario${nivel}${year}`)
    const currentTime = new Date()
    const modifiedList = daysList.map((record) => {
      return { ...record, status: 'disabled', createdAt: currentTime, salones: [] }
    })
    modifiedList.forEach(async (record) => {
      await collection.updateOne({ month: record.month, day: record.day }, { $set: { ...record } }, { upsert: true })
    })
  }
}
