import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import CalendarioControllers from '../controllers/Calendario'

export const calendarioRouter = Router()

calendarioRouter.post('/enable-calendar-days', verifyCredentials, CalendarioControllers.enableCalendarDays)
calendarioRouter.get('/fetch-calendario', verifyCredentials, CalendarioControllers.fetchCalendario)
calendarioRouter.post('/delete-day', verifyCredentials, CalendarioControllers.deleteDayFromCalendar)
calendarioRouter.post('/report-tardanza-alumno', verifyCredentials, CalendarioControllers.reportTardanzaAlumno)
calendarioRouter.get('/fetch-day-id', verifyCredentials, CalendarioControllers.fetchDayId)
calendarioRouter.get('/fetch-current-periodo', verifyCredentials, CalendarioControllers.fetchCurrentPeriodo)
calendarioRouter.post('/set-current-periodo', verifyCredentials, CalendarioControllers.setCurrentPeriodo)
