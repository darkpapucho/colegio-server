import express, { Request, Response, NextFunction } from 'express'
import { cors } from './middleware/cors'
import { userRouter } from './routes/user'
import { alumnoRouter } from './routes/alumno'
import { documentoRouter } from './routes/documento'
import { errorResponseHandler } from './error/errors'
import { empleadoRouter } from './routes/empleado'
import { calendarioRouter } from './routes/calendario'
import { pensionRouter } from './routes/pension'
import { anotacionesRelevantesRouter } from './routes/anotacionesRelevantes'
import { anunciosRouter } from './routes/anuncios'
import { cursosRouter } from './routes/cursos'
import { notasRouter } from './routes/notas'
import { hashPassword } from './utils/hashPassword'
import { pagosRouter } from './routes/pagos'
import { asistenciaEmpleadosRouter } from './routes/asistenciaColegio'
// import { hashPassword } from './utils/hashPassword'

const PORT = process.env.PORT || 4000
const app = express()
app.use(express.json())
app.use(cors)
app.get('/', (_req, res) => res.send('Colegio Jesús el Nazareno - Dist. Ancón'))
app.use('/user', userRouter)
app.use('/alumno', alumnoRouter)
app.use('/documento', documentoRouter)
app.use('/empleado', empleadoRouter)
app.use('/calendario', calendarioRouter)
app.use('/pensiones', pensionRouter)
app.use('/anotaciones-relevantes', anotacionesRelevantesRouter)
app.use('/announcements', anunciosRouter)
app.use('/cursos', cursosRouter)
app.use('/notas', notasRouter)
app.use('/pagos', pagosRouter)
app.use('/asistencia-empleados', asistenciaEmpleadosRouter)
app.get('/pass', async (req, res) => {
  const { password } = req.query

  const hashedPass = await hashPassword(password as string)
  res.send(hashedPass)
})
// app.use('/pagos', pagosRouter)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.log('error catched')
  console.log({ err })
  errorResponseHandler(res, err)
})

app.listen(PORT, () => {
  console.log(`jesus nazareno server is listening`)
})
