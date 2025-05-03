import { Request, Response, NextFunction } from 'express'
import { config } from 'dotenv'
config()
const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN!.split(',') : ['http://localhost:3000', 'http://localhost:3050']

export const cors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin') //extract origin from the headers
  //const route = req.url

  if (origin && ALLOWED_ORIGINS.some((element) => element === origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', ['PUT', 'POST', 'DELETE', 'GET', 'PATCH', 'OPTIONS'])
    res.setHeader('Access-Control-Allow-Headers', ['Year', 'Nivel', 'Token', 'Content-Type', 'Content-Length', 'Accept', 'Authentication', 'File-Size', 'Accept-Encoding', 'Accept-Language'])
    res.setHeader('Access-Control-Expose-Headers', ['Token'])
    res.setHeader('Access-Control-Allow-credentials', 'include')
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
  }
  
  return next()
}
