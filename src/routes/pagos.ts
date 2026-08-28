import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import PagosController from '../controllers/Pagos'
export const pagosRouter = Router()

pagosRouter.post('/get-recibo-matricula', verifyCredentials, PagosController.getReciboMatricula)
pagosRouter.get('/fetch-otras-deudas', verifyCredentials, PagosController.fetchOtrasDeudas)
pagosRouter.post('/registrar-item-deuda', verifyCredentials, PagosController.registrarItemDeuda)
pagosRouter.post('/pagar-item-deuda', verifyCredentials, PagosController.pagarItemDeuda)
pagosRouter.post('/comentar-item-deuda', verifyCredentials, PagosController.updateItemDeudaComentarios)
