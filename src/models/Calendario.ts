import { AggregationCursor, ClientSession, ObjectId, WithId } from 'mongodb'
import { mongoClient } from '../db'
import { EstadoMatricula, Grado, Nivel, Seccion, Year } from '../types/enums'
import { CalendarioDay, Month } from '../types/asistencia'
import { AttendanceRecord, EnableDayList } from '../types/calendario'
import { ErrorMessages } from '../error/enums'
import { convertPeriodoKeyToIndex } from '../utils/generarBoletaNotas/utils/utils'
import { AsistenciaRecord, AsistenciaValue, Periodo } from '../types/alumno'
import convertDateToPeriodo from '../utils/convertDateToPeriodo'
import { convertNumberToMonthName, getPeriodoEndDate, getPeriodoStartDate } from '../vars/periodosDates'
import { getMonthsBetween, MONTHS_YEAR } from '../utils/calendario'

export default class Calendario {
  static async fetchAsistenciaListByDayIdAndValue({ nivel, year, dayId, asistenciaValue }: { asistenciaValue: AsistenciaValue; nivel: Nivel; year: Year; dayId: string }) {
    const cursor = mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .aggregate([
        { $match: {} },
        {
          $project: {
            alumnoId: 1,
            records: { $filter: { input: '$records', as: 'records', cond: { $and: [{ $eq: ['$$records.dayId', new ObjectId(dayId)] }, { $eq: ['$$records.asistencia', asistenciaValue] }] } } },
          },
        },
        { $match: { $expr: { $gt: [{ $size: '$records' }, 0] } } },
        { $lookup: { from: `matriculados${nivel}${year}`, localField: 'alumnoId', foreignField: '_id', as: 'estudiante' } },
        { $project: { estudiante: { $arrayElemAt: ['$estudiante', 0] }, records: 1 } },
        { $project: { _id: '$estudiante._id', nombreCompleto: '$estudiante.nombreCompleto', grado: '$estudiante.grado', seccion: '$estudiante.seccion', records: 1 } },
      ])
    const list = []
    for await (const doc of cursor) {
      list.push(doc)
    }
    return list
  }

  static async getAvailableDaysFromCalendarioByPeriodo({ nivel, year, periodo }: { nivel: Nivel; year: Year; periodo: Periodo }) {
    const periodoStart = getPeriodoStartDate(periodo)
    const periodoEnd = getPeriodoEndDate(periodo)
    const beginMonth = convertNumberToMonthName(new Date(periodoStart).getMonth())
    const beginDay = new Date(periodoStart).getDate()
    const lastMonth = convertNumberToMonthName(new Date(periodoEnd).getMonth())
    const lastDay = new Date(periodoEnd).getDate()
    const betweenMonths = []
    for (let i = new Date(periodoStart).getMonth() + 1; i < new Date(periodoEnd).getMonth(); i++) {
      betweenMonths.push({ month: convertNumberToMonthName(i) })
    }
    const cursor = mongoClient
      .db()
      .collection(`calendario${nivel}${year}`)
      .aggregate<{ day: number; month: Month }>([
        {
          $match: {
            $or: [{ $and: [{ month: beginMonth }, { day: { $gte: beginDay } }] }, ...betweenMonths, { $and: [{ month: lastMonth }, { day: { $lte: lastDay } }] }],
          },
        },
      ])
    const availableDays = []
    for await (const doc of cursor) {
      availableDays.push(doc)
    }
    return availableDays
  }

  static async insertNewMatriculaRecordAsistenciaEscolar({ nivel, year, records, alumnoId, session }: { session?: ClientSession; nivel: Nivel; year: Year; records: AsistenciaRecord[]; alumnoId: ObjectId }) {
    const result = await mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .insertOne({ alumnoId, records }, { session: session ? session : undefined })
    return result
  }

  static async fetchLastDayOfCalendarioEscolar({ nivel, year }: { nivel: Nivel; year: Year }) {
    const results = mongoClient.db().collection<{ _id: ObjectId; month: Month; day: number }>(`calendario${nivel}${year}`).find({})
    const monthsRecorded: number[] = []
    const records = []
    for await (const result of results) {
      records.push(result)
      const monthIndex = MONTHS_YEAR.findIndex((element) => element === result.month)
      if (!monthsRecorded.includes(monthIndex)) {
        monthsRecorded.push(monthIndex)
      }
    }
    const maxMonth: Month = convertNumberToMonthName(monthsRecorded.sort((prev, curr) => (curr > prev ? 1 : -1))[0])
    const recordsFromMaxMonth = records.filter((elem) => elem.month === maxMonth).sort((prev, curr) => (prev.day < curr.day ? 1 : -1))

    return recordsFromMaxMonth[0]
  }

  static async getCalendarioDaysRange({ nivel, year, startDate, endDate }: { endDate: Date; nivel: Nivel; year: Year; startDate: Date }) {
    const beginMonth = convertNumberToMonthName(startDate.getMonth())
    const beginDay = startDate.getDate()
    const lastMonth = convertNumberToMonthName(endDate.getMonth())
    const lastDay = endDate.getDate()

    const betweenMonths = []
    for (let i = startDate.getMonth() + 1; i < endDate.getMonth(); i++) {
      betweenMonths.push({ month: convertNumberToMonthName(i) })
    }

    let results: AggregationCursor<{
      month: Month
      day: number
      _id: ObjectId
    }> | null = null
    if (lastMonth == beginMonth) {
      results = mongoClient
        .db()
        .collection(`calendario${nivel}${year}`)
        .aggregate<{ month: Month; day: number; _id: ObjectId }>([
          {
            $match: {
              $and: [{ $and: [{ month: beginMonth }, { day: { $gte: beginDay } }] }, { $and: [{ month: lastMonth }, { day: { $lte: lastDay } }] }],
            },
          },
        ])
    } else {
      results = mongoClient
        .db()
        .collection(`calendario${nivel}${year}`)
        .aggregate<{ month: Month; day: number; _id: ObjectId }>([
          {
            $match: {
              $or: [{ $and: [{ month: beginMonth }, { day: { $gte: beginDay } }] }, ...betweenMonths, { $and: [{ month: lastMonth }, { day: { $lte: lastDay } }] }],
            },
          },
        ])
    }

    const calendarioDays: { _id: ObjectId; month: Month; day: number }[] = []
    for await (const result of results!) {
      calendarioDays.push(result)
    }
    return calendarioDays
  }

  static async getAsistenciaDayStatus({ alumnoId, dayId, nivel, year }: { nivel: Nivel; year: Year; alumnoId: string; dayId: string }) {
    const result = mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .aggregate<{ _id: ObjectId; record: { justificado: boolean } }>([
        { $match: { alumnoId: new ObjectId(alumnoId) } },
        {
          $project: {
            record: {
              $filter: {
                input: '$records',
                as: 'records',
                cond: { $eq: ['$$records.dayId', new ObjectId(dayId)] },
              },
            },
          },
        },
        { $project: { _id: 0, record: { $arrayElemAt: ['$record', 0] } } },
      ])
    const results = []
    for await (const record of result) {
      results.push(record)
    }
    return results[0]
  }

  static async justificarFalta({ nivel, year, dayId, alumnoId, periodo }: { periodo: Periodo; nivel: Nivel; year: Year; dayId: string; alumnoId: string }) {
    const session = mongoClient.startSession()
    session.startTransaction()
    const result = await mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId), 'records.dayId': new ObjectId(dayId) }, { $set: { 'records.$.justificado': true } })

    if (!result.acknowledged || !result.modifiedCount) {
      await session.abortTransaction()
      await session.endSession()
      throw new Error(ErrorMessages.DATA_BASE_ERROR)
    }
    const result2 = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateOne({ alumnoId: new ObjectId(alumnoId) }, { $inc: { [`inasistencias.injustificadas.${convertPeriodoKeyToIndex(periodo)}`]: -1, [`inasistencias.justificadas.${convertPeriodoKeyToIndex(periodo)}`]: 1 } })

    if (!result2.acknowledged || !result2.modifiedCount) {
      await session.abortTransaction()
      await session.endSession()
      throw new Error(ErrorMessages.DATA_BASE_ERROR)
    }
    await session.commitTransaction()
    await session.endSession()
  }

  static async getAsistenciaRecordPeriodo({ periodo, nivel, year, alumnosIds }: { alumnosIds: ObjectId[]; periodo: Periodo; nivel: Nivel; year: Year }) {
    const periodoStart = getPeriodoStartDate(periodo)
    const periodoEnd = getPeriodoEndDate(periodo)
    const beginMonth = convertNumberToMonthName(new Date(periodoStart).getMonth())
    const beginDay = new Date(periodoStart).getDate()
    const lastMonth = convertNumberToMonthName(new Date(periodoEnd).getMonth())
    const lastDay = new Date(periodoEnd).getDate()
    const betweenMonths = getMonthsBetween(new Date(periodoStart), new Date(periodoEnd), '$$record.month')

    // for (let i = new Date(periodoStart).getMonth() + 1; i < new Date(periodoEnd).getMonth(); i++) {
    //   betweenMonths.push({ $eq: ['$$record.month', convertNumberToMonthName(i)] })
    // }
    const cursor = mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .aggregate<AttendanceRecord>([
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
              justificado: 1,
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
    const response = await mongoClient.db().collection('currentPeriodo').updateOne({ nivel, year }, { $set: { periodo } }, { upsert: true })
    return response
  }
  static async fetchCurrentPeriodo({ nivel, year }: { nivel: Nivel; year: Year }) {
    const response = await mongoClient.db().collection<WithId<{ nivel: Nivel; year: Year; periodo: Periodo }>>('currentPeriodo').findOne({ nivel, year: year })
    return response
  }
  static async fetchADayAsistenciaRecord({ nivel, year, alumnoId, dayId }: { nivel: Nivel; year: Year; alumnoId: string; dayId: string }) {
    const cursor = mongoClient
      .db()
      .collection(`asistencias${nivel}${year}`)
      .aggregate<{ _id: ObjectId; alumnoId: ObjectId; records: { dayId: ObjectId; asistencia: AsistenciaValue; day: number; month: Month; issuer: ObjectId; justificado?: boolean } }>([
        { $match: { alumnoId: new ObjectId(alumnoId) } },
        { $unwind: { path: '$records' } },
        { $match: { 'records.dayId': new ObjectId(dayId) } },
      ])
    const results: { _id: ObjectId; alumnoId: ObjectId; records: { dayId: ObjectId; asistencia: AsistenciaValue; day: number; month: Month; issuer: ObjectId; justificado?: boolean } }[] = []
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
      .updateOne({ alumnoId: new ObjectId(alumnoId), 'records.dayId': new ObjectId(dayId) }, { $set: { 'records.$.asistencia': 'T', 'records.$.issuer': new ObjectId(issuer), 'records.$.modified': new Date() } })

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

  static async fetchAsistenciaListByGradoSeccionDayId({
    nivel,
    year,
    grado,
    seccion,
    dayId,
    estadosMatricula,
  }: {
    nivel: Nivel
    year: Year
    grado: Grado
    seccion: Seccion
    dayId: string
    estadosMatricula: EstadoMatricula[]
  }) {
    const cursor = mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .aggregate([
        { $match: { grado, seccion, estadoMatricula: { $in: [...estadosMatricula] } } },
        { $lookup: { from: `asistencias${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'estudiante' } },
        { $project: { _id: 0, nombreCompleto: 1, estudiante: { $arrayElemAt: ['$estudiante', 0] } } },
        { $project: { nombreCompleto: 1, alumnoId: '$estudiante.alumnoId', asistencia: '$estudiante.records' } },
        {
          $project: {
            nombreCompleto: 1,
            alumnoId: 1,
            asistencia: {
              $filter: {
                input: '$asistencia',
                as: 'asistencia',
                cond: { $eq: ['$$asistencia.dayId', new ObjectId(dayId)] },
              },
            },
          },
        },

        { $project: { nombreCompleto: 1, alumnoId: 1, asistencia: { $arrayElemAt: ['$asistencia', 0] } } },
        { $match: { asistencia: { $exists: true } } },
        { $project: { nombreCompleto: 1, alumnoId: 1, asistencia: '$asistencia.asistencia' } },
        { $sort: { nombreCompleto: 1 } },
      ])
    const result = []
    for await (const doc of cursor) {
      result.push(doc)
    }
    return result
  }
}
