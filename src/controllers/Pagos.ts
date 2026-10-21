import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import generateReciboMatricula from '../utils/Recibos/generateReciboMatrícula'
import { ReciboData } from '../types/recibo'
import PdfDocument from 'pdfkit'
import { extractNivelYearFromHeaders } from '../utils/global'
import Pagos from '../models/Pagos'
import { responseOk } from '../utils/responses'
import { ItemDeuda } from '../types/pagos'

const COSTO_MATRICULA_2026 = 150

export default class PagosController {
  static async updateItemDeudaComentarios(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, itemDeudaId, comentarios, fecha } = req.body

      const response = await Pagos.updateItemDeudaComentarios({ nivel, year, alumnoId, itemDeudaId, comentarios, fecha })

      if (!response.modifiedCount) throw new Error('no se pudo actualizar los comentarios')
      res.status(200).send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async pagarItemDeuda(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId, itemDeudaId, abonado, fecha } = req.body
      const response = await Pagos.pagarItemDeuda({ nivel, year, alumnoId, itemDeudaId, abonado, fecha })

      if (!response.acknowledged) throw new Error('no se pudo realizar el pago')
      res.status(200).send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async registrarItemDeuda(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { itemDeuda, issuer, alumnoId }: { itemDeuda: ItemDeuda; issuer: string; alumnoId: string } = req.body
      const response = await Pagos.registrarNuevaDeuda({ alumnoId, item: itemDeuda, nivel, year, fecha: itemDeuda.fecha, issuer })
      res.send(responseOk({ ...itemDeuda, issuer, _id: response }))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async getReciboMatricula(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { reciboMatricula } = req.body

      const data: ReciboData | null = await Pagos.requestReciboById({ nivel, year, reciboId: reciboMatricula })
      if (!data) throw new Error('Invalid recibo, unable to retrieve data')
      const pdfDocument = new PdfDocument({ layout: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 }, autoFirstPage: false, size: 'A4' })
      pdfDocument.pipe(res)
      generateReciboMatricula(data, pdfDocument, COSTO_MATRICULA_2026)
      pdfDocument.end()
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async fetchOtrasDeudas(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { soloDeudasPendientes } = req.query

      const data = await Pagos.fetchOtrasDeudas({ nivel, year, soloDeudasPendientes: soloDeudasPendientes == 'true' })

      res.send(responseOk(data))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  //   static async nuevoPago(req: Request, res: Response) {
  //     try {
  //       const { email, phone, token, amount } = req.body
  //       console.log({ email, phone, token, amount: +amount })
  //       const requestToken = await axios.post(
  //         'https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=TEST-6e888352-5516-4958-98c5-afa41d70dbe6',
  //         { phoneNumber: '111111111', otp: '123456', requestId: '312736712fsaf4234' },
  //         { headers: { 'Content-Type': 'application/json' } },
  //       )
  //       console.log({ token: requestToken.data.id })
  //       const body = {
  //         transaction_amount: 1.0,
  //         token: 'TEST-12345678901234567890123456789012', // Fake test token
  //         payment_method_id: 'yape',
  //         payer: {
  //           email: 'test_user_123456@testuser.com',
  //           phone: { area_code: '51', number: '111111111' },
  //         },
  //         installments: 1,
  //       }
  //       console.log({ body })
  //       // const response = await Pagos.newPago({ body })

  //       const bearerToken = 'TEST-4685814286484028-041302-8914fc00609dd310f391c28744ebca75-163348043'
  //       await axios.post('https://api.mercadopago.com/v1/payments', body, {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'X-Idempotency-Key': Date.now().toString() + Math.random().toString(36).substring(2),
  //           Authorization: 'Bearer ' + bearerToken,
  //         },
  //       })

  //       //   console.log({ response2 })
  //       res.send(responseOk(null))
  //     } catch (err) {
  //       //   console.log((err as any).errors[0]?.details)
  //       errorResponseHandler(res, err)
  //     }
  //   }
}
