import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import { extractNivelYearFromHeaders } from '../utils/global'
import Cursos from '../models/Cursos'
import { responseError, responseOk } from '../utils/responses'
import { Grado, Seccion } from '../types/enums'

export default class CursosController {
  static async updateCursosSalon(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { cursos, grado, seccion } = req.body

      const response = await Cursos.updateCursosSalon({ nivel, year, cursos, grado, seccion })
      if (!response.acknowledged || !response.matchedCount) {
        return res.send(responseError(`no se pudo modificar los cursos de ${grado} ${seccion}`))
      }
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
