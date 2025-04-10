import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import PensionController from '../controllers/pension'

export const pensionRouter = Router()

pensionRouter.post('/get-lista-by-grado-seccion', verifyCredentials, PensionController.getListGradoSeccion)
pensionRouter.post('/pagar-pension-alumnoid-mes', verifyCredentials, PensionController.pagarPensionByAlumnoIdAndMonth)
pensionRouter.post('/update-monto-pagar-pensiones', verifyCredentials, PensionController.updateMontoPagarPension)
