import { ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'
import { Nivel, Year } from '../types/enums'
import { CalendarioDay, Month } from '../types/asistencia'
import { EnableDayList } from '../types/calendario'
import { ErrorMessages } from '../error/enums'
import { convertPeriodoKeyToIndex } from '../utils/generarBoletaNotas/utils/utils'
import { AsistenciaValue, Periodo } from '../types/alumno'
import convertDateToPeriodo from '../utils/convertDateToPeriodo'
import { convertNumberToMonthName, getPeriodoEndDate, getPeriodoStartDate } from '../vars/periodosDates'

export default class Calendario {
  static async getAsistenciaRecordPeriodo({ periodo, nivel, year, alumnosIds }: { alumnosIds: ObjectId[]; periodo: Periodo; nivel: Nivel; year: Year }) {
    const periodoStart = getPeriodoStartDate(periodo)
    const periodoEnd = getPeriodoEndDate(periodo)
    const beginMonth = convertNumberToMonthName(new Date(periodoStart).getMonth())
    const beginDay = new Date(periodoStart).getDate()
    const lastMonth = convertNumberToMonthName(new Date(periodoEnd).getMonth())
    const lastDay = new Date(periodoEnd).getDate()
    const betweenMonths = []
    for (let i = new Date(periodoStart).getMonth() + 1; i < new Date(periodoEnd).getMonth(); i++) {
      betweenMonths.push({ $eq: ['$$record.month', convertNumberToMonthName(i)] })
    }
    const cursor = mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .aggregate<{ nombreCompleto: string; alumnoId: ObjectId; records: { day: number; month: Month; asistencia: AsistenciaValue; dayId: ObjectId }[] }[]>([
        { $match: { alumnoId: { $in: [...alumnosIds] } } },
        { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
        {
          $project: {
            _id: 0,
            alumno: { $arrayElemAt: ['$estudiante', 0] },
            alumnoId: 1,
            records: {
              $filter: {
                input: '$records',
                as: 'record',
                cond: {
                  $or: [
                    {
                      $and: [{ $eq: ['$$record.month', beginMonth] }, { $gte: ['$$record.day', beginDay] }],
                    },
                    ...betweenMonths,
                    {
                      $and: [{ $eq: ['$$record.month', lastMonth] }, { $lte: ['$$record.day', lastDay] }],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            nombreCompleto: '$alumno.nombreCompleto',
            alumnoId: 1,
            records: {
              day: 1,
              month: 1,
              asistencia: 1,
              dayId: 1,
            },
          },
        },
        { $sort: { nombreCompleto: 1 } },
      ])
    const results = []
    for await (const record of cursor) {
      results.push(record)
    }

    return results
  }
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
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $inc: { [`tardanzas.injustificadas.${convertPeriodoKeyToIndex(convertDateToPeriodo(new Date()))}`]: 1 } })

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
