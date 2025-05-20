import { Request, Response } from 'express'
import { errorResponseHandler } from '../error/errors'
import { extractNivelYearFromHeaders } from '../utils/global'
import Notas from '../models/Notas'
import { responseOk } from '../utils/responses'
import { EstadoMatricula, Grado, Seccion } from '../types/enums'
import Cursos from '../models/Cursos'
import Empleado from '../models/empleado'
import PdfDocument from 'pdfkit'
import generateLibretaPrimariaPDF from '../utils/generateNuevasLibretasPrimaria/generateLibretasPrimaria'
import Calendario from '../models/Calendario'
import { RecordNotas } from '../types/notas'
import { CURSO_SALON } from '../types/cursos'

import { zipLibretasPrimaria } from '../utils/generateNuevasLibretasPrimaria/archiver'

export default class NotasController {
  static async getNotasByGradoSeccionProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      if (nivel !== 'primaria') throw new Error('ruta válida solo para el nivel inicial')
      const { grado, seccion, isTutor, cursosProfesor } = req.body

      if (!grado || !seccion) throw new Error('grado o seccion inválido')
      const cursosQuery: { [key: string]: 1 | 0 } = Object.fromEntries((cursosProfesor as CURSO_SALON[]).map((curso) => [curso.key, 1]))

      const registroNotas = await Notas.getNotasByGradoSeccionFromCursosProfesor({ grado, seccion, isTutor, cursosQuery, nivel, year })

      res.send(responseOk(registroNotas))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async updateRecordNotasByTeacher(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { isTutor, registro, cursosProfesor }: { isTutor: boolean; registro: RecordNotas[]; cursosProfesor: CURSO_SALON[] } = req.body
      await Notas.updateRecordNotasByTeacher({ nivel, year, registro, isTutor, cursosProfesor })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async generateLibretasPrimaria(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      if (nivel !== 'primaria') throw new Error('Esta ruta solo aplica al nivel primaria')
      const { grado, seccion, zipped, estadosMatricula }: { grado: Grado; seccion: Seccion; all: boolean; zipped: boolean; estadosMatricula: EstadoMatricula[] } = req.body
      // console.log({ nivel, year, zipped })
      const tutor = await Empleado.findTutorByGradoSeccion({ grado, seccion, nivel, year })
      const registro = await Notas.getNotasByGradoSeccion({ nivel, year, grado, seccion, estadosMatricula })
      const cursosSalon = await Cursos.getCursosSalon({ nivel, grado, seccion, year })
      const currentPeriodo = await Calendario.fetchCurrentPeriodo({ nivel, year })
      if (cursosSalon == null || !currentPeriodo || !currentPeriodo) throw new Error('error parsing data')
      if (zipped) {
        await zipLibretasPrimaria({ res, tutor: tutor.nombreCompleto, nivel, grado, seccion, year, registro, cursosSalon: cursosSalon.cursos, periodo: currentPeriodo.periodo })
      } else {
        const pdfDocument = new PdfDocument({ layout: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 }, autoFirstPage: false, size: 'A4' })
        pdfDocument.pipe(res)
        registro.forEach((row) => {
          generateLibretaPrimariaPDF({
            notas: row,
            nivel,
            year,
            grado,
            seccion,
            doc: pdfDocument,
            tutor: tutor.nombreCompleto,
            cursosSalon: cursosSalon!.cursos,
            periodo: currentPeriodo?.periodo,
          })
        })

        pdfDocument.end()
      }
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async getNotasByGradoSeccion(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      if (nivel !== 'primaria') throw new Error('ruta válida solo para el nivel inicial')
      const { grado, seccion } = req.query

      if (!grado || !seccion) throw new Error('grado o seccion inválido')
      // const tutor = await Empleado.findTutorByGradoSeccion({ nivel, year, grado: grado as Grado, seccion: seccion as Seccion })

      const registroNotas = await Notas.getNotasByGradoSeccion({ grado: grado as Grado, seccion: seccion as Seccion, nivel, year })
      const cursosSalon = await Cursos.getCursosSalon({ grado: grado as Grado, seccion: seccion as Seccion, nivel, year })

      res.send(responseOk({ registroNotas, cursosSalon: cursosSalon?.cursos }))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
  static async updateRecordNotasPrimaria(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { registro } = req.body

      const response = await Notas.updateRecordNotasPrimaria({ nivel, year, registro })
      console.log(response.getRawResponse())
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
