import { Request, Response, NextFunction } from 'express'
const ENV_ORIGINS = process.env.ALLOWED_ORIGIN!
const MODE = process.env.NODE_ENV

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN!.split(',') : ['http://localhost:3000', 'http://localhost:3050']

export const cors = (req: Request, res: Response, next: NextFunction) => {
  console.log({ ENV_ORIGINS, MODE })
  const origin = req.get('origin') //extract origin from the headers
  //const route = req.url
  console.log({ ALLOWED_ORIGINS, origin })
  if (origin && ALLOWED_ORIGINS.some((element) => element === origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', ['PUT', 'POST', 'DELETE', 'GET', 'PATCH', 'OPTIONS'])
    res.setHeader('Access-Control-Allow-Headers', [
      'Year',
      'Nivel',
      'Token',
      'Content-Type',
      'Content-Length',
      'Accept',
      'Authentication',
      'File-Size',
      'Accept-Encoding',
      'Accept-Language',
    ])
    res.setHeader('Access-Control-Expose-Headers', ['Token'])
    res.setHeader('Access-Control-Allow-credentials', 'include')
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
  }

  return next()
}
