export type EnableDayList = {
  day: number // 1-31
  month: string // 0 - 11
}[]

export type AttendanceRecord = { nombreCompleto: string; alumnoId: ObjectId; records: { day: number; month: Month; asistencia: AsistenciaValue; dayId: ObjectId; justificado: true | undefined }[] }

export type CalendarioRecord = {
  _id: ObjectId
  month: Month
  day: number
}
