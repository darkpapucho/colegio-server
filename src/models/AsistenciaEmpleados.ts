import { ObjectId } from 'mongodb'
import { mongoClient } from '../db'
import { Year } from '../types/enums'
import { EmpleadoAsistenciaInfo } from '../types/empleado'

export default class AsistenciaEmpleados {
  static async getEmpleadoInfoByFingerprintId({ fingerprintId, year }: { fingerprintId: number; year: Year }) {
    const response = await mongoClient.db().collection<EmpleadoAsistenciaInfo>(`empleados${year}`).findOne({ fingerprintId })
    return response
  }
  static async enrollNewFingerprintId({ year, fingerprintId, empleadoInfo }: { empleadoInfo: any; fingerprintId: number; year: Year }) {
    const { empleadoId, ...rest } = empleadoInfo
    const response = await mongoClient
      .db()
      .collection(`empleados${year}`)
      .updateOne({ empleadoId: new ObjectId(empleadoId as string) }, { $set: { fingerprintId, ...rest } }, { upsert: true })
    return response
  }
  static async marcarAsistenciaEmpleados({ month, day, time, empleadoId, year }: { empleadoId: string; year: Year; month: number; day: number; time: string }) {
    const response = await mongoClient
      .db()
      .collection<EmpleadoAsistenciaInfo>(`asistenciaempleados${year}`)
      .updateOne({ empleadoId: new ObjectId(empleadoId) }, { $push: { asistencias: { month, day, time } } })
    return response
  }
  static async checkAsistenciaRecord({ empleadoId, year, month, day }: { empleadoId: string; year: Year; month: number; day: number }) {
    const response = await mongoClient
      .db()
      .collection(`asistenciaempleados${year}`)
      .findOne({ empleadoId: new ObjectId(empleadoId), asistencias: { $elemMatch: { day, month } } })
    return response
  }
}
