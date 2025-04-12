import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import AnotacionesRelevantesController from '../controllers/AnotacionesRelevantes'

export const anotacionesRelevantesRouter = Router()

anotacionesRelevantesRouter.post('/editar-anotacion-relevante-by-alumnoId', verifyCredentials, AnotacionesRelevantesController.editarAnotacionByAlumnoId)
anotacionesRelevantesRouter.post('/eliminar-anotacion-relevante-by-alumno-id', verifyCredentials, AnotacionesRelevantesController.eliminarAnotacionByAlumnoId)
