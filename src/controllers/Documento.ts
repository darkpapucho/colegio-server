import Documento from '../models/documentos'
import { GenerateCertificadoConducta, GenerateCertificadoNoAdeudo, GenerateResolucionTraslado } from '../utils/generarDocumentos'
import { assertGrado, assertSeccion, extractNivelYearFromHeaders } from '../utils/global'
import { assertIsAMatriculado, assertIsEmitirDocumentsData, assertIsString } from '../utils/validators'
import { Request, Response } from 'express'
import PdfDocument from 'pdfkit'
import fs from 'fs'
import { errorResponseHandler } from '../error/errors'
import { Alumno } from '../models/alumno'
// import { generadorCursos } from '../utils/generateCursosByGradoSeccion'
import { responseOk } from '../utils/responses'
import { ObjectId } from 'mongodb'
import { RegistroNota } from '../types/documents'

import generarBoletasDeNotasPdf, { createStudentZipInMemory } from '../utils/generarBoletaNotas/generarBoletaNotas'
import { SalonProfesor } from '../types/user'

export default class DocumentoControllers {
  static async fetchNotasByCursos(req: Request, res: Response) {
    const { nivel, year } = extractNivelYearFromHeaders(req)
    const salon = req.body.salon as SalonProfesor

    try {
      //se supone que esta ruta solo es usada por profresores
      const alumnosIdsList = await Alumno.fetchAlumnosIdsByGradoSeccion({ nivel, year, grado: salon.value.grado, seccion: salon.value.seccion })

      const recordNotas = await Documento.fetchNotasPorAlumnosYCursos({ nivel, year, alumnosIdsList, salon })

      res.send(responseOk(recordNotas))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async generateLibretaIndividual(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId } = req.query

      assertIsString(alumnoId)
      const notasRecord = await Documento.getRecordNotasAlumno({ nivel, year, alumnoId })
      if (!notasRecord) {
        throw new Error('No se encontró el record de notas del alumno')
      }
      generarBoletasDeNotasPdf({ res, registros: notasRecord, year, nivel })
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async generateLibretasByGradoSeccion(req: Request, res: Response) {
    try {
      const { grado, seccion, estadosMatricula, zipped } = req.body

      const { nivel, year } = extractNivelYearFromHeaders(req)
      assertGrado(grado)
      assertSeccion(seccion)

      const registros = await Documento.getRegistrosByGradoSeccion({ grado, seccion, nivel, year, estadosMatricula })

      //creacion de la libreta

      //zip archive

      if (zipped) {
        await createStudentZipInMemory({ registros, nivel, grado, seccion, year, res })
      } else {
        generarBoletasDeNotasPdf({ res, registros, year, nivel })
      }
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async updateRegistroNotasProfesor(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { registro, isTutor } = req.body
      await Documento.updateRegistroNotasProfesor({ nivel, year, isTutor, registro })
      res.send(responseOk(null))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async updateRegistroNotas(req: Request, res: Response) {
    try {
      const { grado, seccion, registro } = req.body
      const { nivel, year } = extractNivelYearFromHeaders(req)
      assertGrado(grado)
      assertSeccion(seccion)
      const collectionName = `notas${nivel}${year}`
      await Documento.updateRegistroNotas({ collectionName, registro: registro as RegistroNota[] })
      res.send(responseOk(null))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async fetchRegistroNotasBySalon(req: Request, res: Response) {
    const { grado, seccion } = req.query
    const { nivel, year } = extractNivelYearFromHeaders(req)
    assertGrado(grado)
    assertSeccion(seccion)

    // const cursos = generadorCursos(nivel, grado)
    try {
      const alumnos = await Alumno.getByGradoSeccion({ grado, seccion, nivel, year })

      const alumnosIds = alumnos.map((alumno) => new ObjectId(alumno._id))

      const registroNotas = await Documento.fetchRegistroNotasBySalon({ nivel, year, alumnosIds })

      res.send(responseOk(registroNotas))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async emitirDocumentos(req: Request, res: Response) {
    try {
      const { alumno, data } = req.body
      const { nivel, year } = extractNivelYearFromHeaders(req)

      assertIsAMatriculado(alumno)
      assertIsEmitirDocumentsData(data)
      const document = new PdfDocument({ autoFirstPage: false, layout: 'portrait' })
      document.pipe(fs.createWriteStream('./files/document.pdf'))
      document.pipe(res)

      if (data.selectedDocuments.certificadoNoAdeudo) {
        GenerateCertificadoNoAdeudo({ document, alumno, fechaEmision: data.fechaEmision, nivel })
      }
      if (data.selectedDocuments.certificadoConducta) {
        GenerateCertificadoConducta({ document, nivel, alumno, añoEstudio: year, fechaEmision: data.fechaEmision })
      }
      if (data.selectedDocuments.resolucionTraslado) {
        const collectionName = `resoluciones${nivel}${new Date(data.fechaEmision).getFullYear()}`
        const numeroResolucion = await Documento.fetchNumeroResolucion(collectionName)
        GenerateResolucionTraslado({ document, alumno, data, nivel, numeroResolucion })
        Documento.increaseNumeroResolucion(collectionName)
      }
      document.end()
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
}
