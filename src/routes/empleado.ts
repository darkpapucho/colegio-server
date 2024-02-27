import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import EmpleadoControllers from '../controllers/empleado'

export const empleadoRouter = Router()

empleadoRouter.post('/crear-profesor', verifyCredentials, EmpleadoControllers.crearProfesor)
