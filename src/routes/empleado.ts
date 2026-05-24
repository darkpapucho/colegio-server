import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import EmpleadoControllers from '../controllers/empleado'

export const empleadoRouter = Router()

empleadoRouter.post('/crear-profesor', verifyCredentials, EmpleadoControllers.crearProfesor)
empleadoRouter.get('/fetch-profesores', verifyCredentials, EmpleadoControllers.fetchProfesores)
empleadoRouter.post('/update-profesor', verifyCredentials, EmpleadoControllers.updateProfesor)
empleadoRouter.post('/change-profesor-password', verifyCredentials, EmpleadoControllers.changeProfesorPassword)
empleadoRouter.post('/delete-profesor', verifyCredentials, EmpleadoControllers.deleteProfesor)
empleadoRouter.post('/agregar-horario-cell', verifyCredentials, EmpleadoControllers.agregarHorarioCell)
empleadoRouter.post('/eliminar-horario-cell', verifyCredentials, EmpleadoControllers.eliminarHorarioCell)
empleadoRouter.post('/agregar-anuncio-profesor', verifyCredentials, EmpleadoControllers.agregarAnuncioProfesor)
empleadoRouter.post('/delete-anuncio-profesor', verifyCredentials, EmpleadoControllers.deleteAnuncioProfesor)
empleadoRouter.post('/agregar-psicologo', verifyCredentials, EmpleadoControllers.agregarPsicologo)
empleadoRouter.get('/fetch-psicologos', verifyCredentials, EmpleadoControllers.fetchPsicologos)
