import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import PagosController from '../controllers/Pagos'
export const pagosRouter = Router()

pagosRouter.post('/nuevo-pago-yape', verifyCredentials, PagosController.nuevoPago)
