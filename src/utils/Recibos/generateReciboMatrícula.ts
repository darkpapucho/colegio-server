import { ReciboData } from '../../types/recibo'
import { reciboBody, reciboFooter, reciboHeader, reciboTotalPagar } from './utils'

export default function generateReciboMatricula(data: ReciboData, pdf: PDFKit.PDFDocument, costo: number) {
  reciboHeader(data, pdf)
  reciboBody(data, pdf, costo)
  reciboTotalPagar(data, pdf)
  reciboFooter(pdf)
}
