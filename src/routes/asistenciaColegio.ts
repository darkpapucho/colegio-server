import { Router } from 'express'
import AsistenciaEmpleadosController from '../controllers/AsistenciaEmpleados'
export const asistenciaEmpleadosRouter = Router()

asistenciaEmpleadosRouter.get('/get-empleado-info-by-fingerprint', AsistenciaEmpleadosController.getEmpleadoInfoByFingerprintId)
