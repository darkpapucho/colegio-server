import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import PagosController from '../controllers/Pagos'
export const pagosRouter = Router()

pagosRouter.post('/get-recibo-matricula', verifyCredentials, PagosController.getReciboMatricula)
