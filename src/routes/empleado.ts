import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import EmpleadoControllers from '../controllers/empleado'

export const empleadoRouter = Router()

empleadoRouter.post('/crear-profesor', verifyCredentials, EmpleadoControllers.crearProfesor)
empleadoRouter.get('/fetch-profesores', verifyCredentials, EmpleadoControllers.fetchProfesores)
empleadoRouter.post('/update-profesor', verifyCredentials, EmpleadoControllers.updateProfesor)
empleadoRouter.post('/change-profesor-password', verifyCredentials, EmpleadoControllers.changeProfesorPassword)
empleadoRouter.post('/delete-profesor', verifyCredentials, EmpleadoControllers.deleteProfesor)
