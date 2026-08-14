import { ReciboData } from '../../types/recibo'
import { reciboBody, reciboFooter, reciboHeader, reciboMora, reciboTotalPagar } from './utils'

export default function generateReciboPension(data: ReciboData, pdf: PDFKit.PDFDocument, costo: number) {
  reciboHeader(data, pdf)
  reciboBody(data, pdf, costo)
  reciboMora(data, pdf)
  reciboTotalPagar(data, pdf)
  reciboFooter(pdf)
}
