import { Router } from 'express'
import { AlumnoControllers } from '../controllers/alumno'
import { verifyCredentials } from '../middleware/verifyCredentials'

export const alumnoRouter = Router()

alumnoRouter.get('/matriculados', verifyCredentials, AlumnoControllers.fetchMatriculados)
alumnoRouter.post('/matricular', verifyCredentials, AlumnoControllers.nuevaMatricula)
alumnoRouter.get('/get-ratificar-list', verifyCredentials, AlumnoControllers.fetchRatificarList)
alumnoRouter.post('/ratificar-matricula', verifyCredentials, AlumnoControllers.ratificarMatricula)
alumnoRouter.put('/retirar', verifyCredentials, AlumnoControllers.retirarAlumno)
alumnoRouter.post('/buscar', verifyCredentials, AlumnoControllers.buscarAlumno)
alumnoRouter.post('/editar', verifyCredentials, AlumnoControllers.editarAlumno)
alumnoRouter.post('/fetch-asistencia-list', verifyCredentials, AlumnoControllers.fetchAsistenciaList)
alumnoRouter.post('/update-asistencia-list', verifyCredentials, AlumnoControllers.updateAsistenciaList)
