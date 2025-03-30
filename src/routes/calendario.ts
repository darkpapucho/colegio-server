import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import CalendarioControllers from '../controllers/Calendario'

export const calendarioRouter = Router()

calendarioRouter.post('/enable-calendar-days', verifyCredentials, CalendarioControllers.enableCalendarDays)
calendarioRouter.post('/delete-day', verifyCredentials, CalendarioControllers.deleteDayFromCalendar)
calendarioRouter.post('/report-tardanza-alumno', verifyCredentials, CalendarioControllers.reportTardanzaAlumno)
calendarioRouter.post('/fetch-day-id', verifyCredentials, CalendarioControllers.fetchDayId)
calendarioRouter.post('/set-current-periodo', verifyCredentials, CalendarioControllers.setCurrentPeriodo)
calendarioRouter.post('/get-record-asistencias-grado-seccion-periodo', verifyCredentials, CalendarioControllers.getRecordAsistenciasPeriodo)
calendarioRouter.post('/justificar-falta', verifyCredentials, CalendarioControllers.justificarFalta)
calendarioRouter.post('/fetch-asistencia-list-by-grado-seccion-day-id', verifyCredentials, CalendarioControllers.fetchAsistenciaListByGradoSeccionDayId)
calendarioRouter.post('/fetch-today-tardanza-list', verifyCredentials, CalendarioControllers.fetchTardanzaListByDayId)
calendarioRouter.post('/update-asistencia-list-by-grado-seccion-day-id', verifyCredentials, CalendarioControllers.updateAsistenciaListByGradoSeccionDayId)
calendarioRouter.get('/fetch-calendario', verifyCredentials, CalendarioControllers.fetchCalendario)
calendarioRouter.get('/fetch-current-periodo', verifyCredentials, CalendarioControllers.fetchCurrentPeriodo)
calendarioRouter.get('/convert-date-to-periodo', verifyCredentials, CalendarioControllers.fetchConvertDateToPeriodo)
calendarioRouter.post('/get-pdf-attendance-list-by-grado-seccion-periodo', verifyCredentials, CalendarioControllers.generatePDFAttendanceListByGradoSeccionPeriodo)
