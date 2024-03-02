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
import PDFDocument from 'pdfkit'
import generarBoletasDeNotas from '../utils/generarBoletaNotas/generarBoletaNotas'

export default class DocumentoControllers {
  static async generateLibretaIndividual(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { alumnoId } = req.query
      console.log({ alumnoId })
      assertIsString(alumnoId)
      const notasRecord = await Documento.getRecordNotasAlumno({ nivel, year, alumnoId })
      if (!notasRecord) {
        throw new Error('No se encontró el record de notas del alumno')
      }
      const libreta = new PDFDocument({
        layout: 'portrait',
        size: 'A4',
        font: 'Courier',
        margins: { top: 20, left: 20, right: 20, bottom: 20 },
        autoFirstPage: false,
      })
      console.log({ notasRecord })
      libreta.pipe(fs.createWriteStream('./files/libretaIndividual.pdf'))
      libreta.pipe(res)
      if (notasRecord.length === 0) {
        libreta.addPage()
        libreta.text('NO HAY ALUMNOS EN ESTE AÑO/SALÓN', 0, 100, {
          width: 600,
          align: 'center',
        })
      } else {
        generarBoletasDeNotas({ document: libreta, registros: notasRecord, year, nivel })
      }
      libreta.end()
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async generateLibretasByGradoSeccion(req: Request, res: Response) {
    try {
      const { grado, seccion } = req.body
      const { nivel, year } = extractNivelYearFromHeaders(req)
      assertGrado(grado)
      assertSeccion(seccion)
      console.log({ grado, seccion, nivel, year })
      const registros = await Documento.getRegistrosByGradoSeccion({ grado, seccion, nivel, year })
      console.log({ registros })
      //creacion de la libreta
      const libretas = new PDFDocument({
        layout: 'portrait',
        size: 'A4',
        font: 'Courier',
        margins: { top: 20, left: 20, right: 20, bottom: 20 },
        autoFirstPage: false,
      })
      libretas.pipe(fs.createWriteStream('./files/libreta.pdf'))
      libretas.pipe(res)
      if (registros.length === 0) {
        libretas.addPage()
        libretas.text('NO HAY ALUMNOS EN ESTE AÑO/SALÓN', 0, 100, {
          width: 600,
          align: 'center',
        })
      } else {
        generarBoletasDeNotas({ document: libretas, registros, year, nivel })
      }
      libretas.end()
    } catch (err) {
      errorResponseHandler(res, err)
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
    console.log({ grado, seccion, nivel, year })
    // const cursos = generadorCursos(nivel, grado)
    try {
      const alumnos = await Alumno.getByGradoSeccion({ grado, seccion, collectionName: `matriculados${nivel}${year}` })

      const alumnosIds = alumnos.map((alumno) => new ObjectId(alumno._id))
      console.log({ alumnosIds })
      const registroNotas = await Documento.fetchRegistroNotasBySalon({ nivel, year, alumnosIds })
      console.log({ registroNotas })
      res.send(responseOk(registroNotas))
    } catch (error) {
      errorResponseHandler(res, error)
    }
  }

  static async emitirDocumentos(req: Request, res: Response) {
    try {
      const { alumno, data } = req.body
      const { nivel, year } = extractNivelYearFromHeaders(req)
      console.log({ alumno, data })
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
