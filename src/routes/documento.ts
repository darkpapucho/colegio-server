import { Router } from 'express'
import { verifyCredentials } from '../middleware/verifyCredentials'
import DocumentoControllers from '../controllers/Documento'
export const documentoRouter = Router()
documentoRouter.post('/emitirdocumentos', verifyCredentials, DocumentoControllers.emitirDocumentos)
documentoRouter.get('/fetch-registro-notas-salon', verifyCredentials, DocumentoControllers.fetchRegistroNotasBySalon)
documentoRouter.post('/update-registro-notas', verifyCredentials, DocumentoControllers.updateRegistroNotas)
documentoRouter.post('/generar-boletas-notas-grado-seccion', verifyCredentials, DocumentoControllers.generateLibretasByGradoSeccion)
documentoRouter.get('/generar-boleta-nota-individual', verifyCredentials, DocumentoControllers.generateLibretaIndividual)
