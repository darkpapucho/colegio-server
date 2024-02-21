import { Request, Response, NextFunction } from 'express'

// const allowedOrigins = ['http://localhost:3000', 'https://jesusnazareno.netlify.app']

export const cors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin') //extract origin from the headers
  console.log({ origin })
  // res.setHeader('Access-Control-Allow-Origin', origin!)
  //   res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS, PATCH')
  //   res.setHeader('Access-Control-Allow-Headers', ['Year', 'Nivel', 'Token', 'Content-Type'])
  //   res.setHeader('Access-Control-Expose-Headers', 'Token')
  //   if (req.method === 'OPTIONS') {
  //     return res.status(200).end()
  //   }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin!)
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, OPTIONS, PATCH')
    res.setHeader('Access-Control-Allow-Headers', ['Year', 'Nivel', 'Token', 'Content-Type'])
    res.setHeader('Access-Control-Expose-Headers', 'Token')
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
  }
  return next()
}
