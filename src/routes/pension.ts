import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import PensionController from '../controllers/pension'

export const pensionRouter = Router()

pensionRouter.post('/get-lista-by-grado-seccion', verifyCredentials, PensionController.getListGradoSeccion)
pensionRouter.post('/pagar-pension-alumnoid-mes', verifyCredentials, PensionController.pagarPensionByAlumnoIdAndMonth)
pensionRouter.post('/update-monto-pagar-pensiones', verifyCredentials, PensionController.updateMontoPagarPension)
pensionRouter.post('/get-pensiones-global-report', verifyCredentials, PensionController.getPensionesGlobalReport)
pensionRouter.post('/get-lista-by-numero-pensiones-atrasadas', verifyCredentials, PensionController.getListAlumnosByNumPensionesAtrasadas)
pensionRouter.post('/get-record-pensiones-pagadas-by-date-range', verifyCredentials, PensionController.getRecordPensionesPagadasByDateRange)
pensionRouter.post('/download-pension-table-grado-seccion-pdf', verifyCredentials, PensionController.generatetPensionesTablePdfByGradoSeccion)
