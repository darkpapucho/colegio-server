import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import AsistenciaController from '../controllers/asistencia'
const asistenciaRouter: Router = Router()

asistenciaRouter.post('/marcar-asistencia', verifyCredentials, AsistenciaController.marcarAsistencia)
