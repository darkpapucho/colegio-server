import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import NotasController from '../controllers/Notas'

export const notasRouter = Router()

notasRouter.get('/get-notas-by-grado-seccion', verifyCredentials, NotasController.getNotasByGradoSeccion)
notasRouter.post('/get-notas-by-grado-seccion-profesor', verifyCredentials, NotasController.getNotasByGradoSeccionProfesor)
notasRouter.post('/update-record-notas-primaria', verifyCredentials, NotasController.updateRecordNotasPrimaria)
notasRouter.post('/generate-libretas-primaria-grado-seccion', verifyCredentials, NotasController.generateLibretasPrimaria)
notasRouter.post('/update-record-notas-primaria-by-teacher', verifyCredentials, NotasController.updateRecordNotasByTeacher)
