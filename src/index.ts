import express, { Request, Response, NextFunction } from 'express'
import { cors } from './middleware/cors'
import { userRouter } from './routes/user'
import { alumnoRouter } from './routes/alumno'
import { documentoRouter } from './routes/documento'
import { errorResponseHandler } from './error/errors'
import { empleadoRouter } from './routes/empleado'
import { calendarioRouter } from './routes/calendario'

const PORT = process.env.PORT || 4000
const app = express()
app.use(express.json())
app.use(cors)

app.use('/user', userRouter)
app.use('/alumno', alumnoRouter)
app.use('/documento', documentoRouter)
app.use('/empleado', empleadoRouter)
app.use('/calendario', calendarioRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.log('error catched')
  console.log({ err })
  errorResponseHandler(res, err)
})

app.listen(PORT, () => {
  console.log(`jesus nazareno server is listening`)
})
