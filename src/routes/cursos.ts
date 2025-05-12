import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import CursosController from '../controllers/Cursos'

export const cursosRouter = Router()
cursosRouter.post('/update-cursos-salon', verifyCredentials, CursosController.updateCursosSalon)
cursosRouter.get('/get-cursos-salon', verifyCredentials, CursosController.getCursosSalon)
