import { MercadoPagoConfig, Order, Payment } from 'mercadopago'

export const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
})
export const order = new Order(client)
export const payment = new Payment(client)
