import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import { extractNivelYearFromHeaders } from '../utils/global'
import Cursos from '../models/Cursos'
import { responseError, responseOk } from '../utils/responses'
import { Grado, Seccion } from '../types/enums'
import { mongoClient } from '../db'
import { CURSO_SALON } from '../types/cursos'
import { Alumno } from '../models/alumno'
import Notas from '../models/Notas'

export default class CursosController {
  static async updateCursosSalon(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { cursos, grado, seccion }: { cursos: CURSO_SALON[]; grado: Grado; seccion: Seccion } = req.body
      const session = mongoClient.startSession()
      session.startTransaction()
      //update las cursos del salon
      const response = await Cursos.updateCursosSalon({ nivel, year, cursos, grado, seccion, session })
      if (!response.acknowledged || !response.matchedCount) {
        await session.abortTransaction()
        await session.endSession()
        throw new Error('no se pudo modificar los cursos del salon')
      }
      const cursosKey = cursos.map((curso) => curso.key)
      const alumnosId = await Alumno.fetchAlumnosIdsByGradoSeccion({ grado, seccion, nivel, year })

      const notasUpdateResponse = await Notas.updateCursosFieldsByAlumnosId({ nivel, year, alumnosId, cursosKey, session })

      if (!notasUpdateResponse.acknowledged || !notasUpdateResponse.matchedCount) {
        await session.abortTransaction()
        await session.endSession()
        throw new Error('no se pudo modificar los cursos del salon')
      }
      await session.commitTransaction()
      await session.endSession()
      return res.send(responseOk(null))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
  static async getCursosSalon(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion } = req.query

      const response = await Cursos.getCursosSalon({ nivel, year, grado: grado as Grado, seccion: seccion as Seccion })

      if (!response) return res.send(responseError(`${grado} ${seccion} no es un salón válido`))
      return res.send(responseOk(response))
    } catch (err) {
      return errorResponseHandler(res, err)
    }
  }
}
