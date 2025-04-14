import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
// import Pagos from '../models/Pagos'
import { responseOk } from '../utils/responses'
import axios from 'axios'

export default class PagosController {
  static async nuevoPago(req: Request, res: Response) {
    try {
      const { email, phone, token, amount } = req.body
      console.log({ email, phone, token, amount: +amount })
      const requestToken = await axios.post(
        'https://api.mercadopago.com/platforms/pci/yape/v1/payment?public_key=TEST-6e888352-5516-4958-98c5-afa41d70dbe6',
        { phoneNumber: '111111111', otp: '123456', requestId: '312736712fsaf4234' },
        { headers: { 'Content-Type': 'application/json' } },
      )
      console.log({ token: requestToken.data.id })
      const body = {
        transaction_amount: 1.0,
        token: 'TEST-12345678901234567890123456789012', // Fake test token
        payment_method_id: 'yape',
        payer: {
          email: 'test_user_123456@testuser.com',
          phone: { area_code: '51', number: '111111111' },
        },
        installments: 1,
      }
      console.log({ body })
      // const response = await Pagos.newPago({ body })

      const bearerToken = 'TEST-4685814286484028-041302-8914fc00609dd310f391c28744ebca75-163348043'
      await axios.post('https://api.mercadopago.com/v1/payments', body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': Date.now().toString() + Math.random().toString(36).substring(2),
          Authorization: 'Bearer ' + bearerToken,
        },
      })

      //   console.log({ response2 })
      res.send(responseOk(null))
    } catch (err) {
      //   console.log((err as any).errors[0]?.details)
      errorResponseHandler(res, err)
    }
  }
}
