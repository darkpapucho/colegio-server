import Documento from '../models/documentos'
import { GenerateCertificadoConducta, GenerateCertificadoNoAdeudo, GenerateResolucionTraslado } from '../utils/generarDocumentos'
import { assertGrado, assertSeccion, extractNivelYearFromHeaders } from '../utils/global'
import { assertIsAMatriculado, assertIsEmitirDocumentsData, assertIsString } from '../utils/validators'
import { Request, Response } from 'express'
import PdfDocument from 'pdfkit'
import fs from 'fs'
import { errorResponseHandler } from '../error/errors'
import { Alumno } from '../models/alumno'
import { responseOk } from '../utils/responses'
import { ObjectId } from 'mongodb'
import { RegistroNota } from '../types/documents'
import { json2csv, Json2CsvOptions } from 'json-2-csv'
import generarBoletasDeNotasPdf, { createStudentZipInMemory } from '../utils/generarBoletaNotas/generarBoletaNotas'
import { SalonProfesor } from '../types/user'
import generateLibretaPrimariaPDF from '../utils/generateNuevasLibretasPrimaria/generateLibretasPrimaria'
import Notas from '../models/Notas'
import Cursos from '../models/Cursos'
import Empleado from '../models/empleado'
// import Calendario from '../models/Calendario'
import { EstadoMatricula, Grado, Seccion } from '../types/enums'
import { convertToLocalDatePeru } from '../utils/convertISODateToLocalDatePeru'

export default class DocumentoControllers {
  static async generateCSVAlumnosListByGradoSeccion(req: Request, res: Response) {
    const { nivel, year } = extractNivelYearFromHeaders(req)
    const { grado, seccion, estadosMatricula }: { grado: Grado; seccion: Seccion; estadosMatricula: EstadoMatricula[] } = req.body
    const withTrasladados = estadosMatricula.some((row) => row == 'TRASLADADO')
    const projection: { [key: string]: 1 | 0 } = { _id: 0, nombreCompleto: 1, dni: 1, grado: 1, seccion: 1, estadoMatricula: 1, fechaMatricula: 1 }
    if (withTrasladados) projection['fechaRetiro'] = 1
    try {
      const alumnos = (
        await Alumno.getByGradoSeccion({
          nivel,
          year,
          grado,
          seccion,
          estadosMatricula,
          projection,
        })
      )
        .sort((prev, curr) => (prev.nombreCompleto > curr.nombreCompleto ? 1 : -1))
        .map((row, index) => {
          const { grado, seccion, ...rest } = row
          const formated = { id: index + 1, ...rest, salon: grado + ' ' + seccion, fechaMatricula: convertToLocalDatePeru(row.fechaMatricula) }
          if (withTrasladados) formated['fechaRetiro'] = convertToLocalDatePeru(row.fechaRetiro)
          return formated
        })
      //.map((row) => ({ alumno: row.nombreCompleto }))

      const options: Json2CsvOptions = {
        emptyFieldValue: '--',

        fieldTitleMap: { id: 'N°', nombreCompleto: 'ALUMNO', dni: 'DNI', salon: 'SALÓN', estadoMatricula: 'ESTADO', fechaMatricula: 'INGRESO' },
      }
      if (withTrasladados) options.fieldTitleMap!['fechaTraslado'] = 'TRASLADO'
      const csv = json2csv(alumnos, options)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=${grado}-${seccion}.csv`)
      res.send(responseOk(csv))
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }
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

      if (nivel === 'inicial') {
        const notasRecord = await Documento.getRecordNotasAlumno({ nivel, year, alumnoId })
        if (!notasRecord) {
          throw new Error('No se encontró el record de notas del alumno')
        }
        generarBoletasDeNotasPdf({ res, registros: notasRecord, year, nivel })
      } else if (nivel === 'primaria') {
        const notas = await Notas.getNotasByAlumnoId({ alumnoId, nivel, year })
        const alumnoData = await Alumno.getById({ nivel, year, id: alumnoId })
        if (!alumnoData) throw new Error('no se encontró al alumno')
        const { grado, seccion } = alumnoData
        const cursosSalon = await Cursos.getCursosSalon({ nivel, year, grado, seccion })
        const tutor = await Empleado.findTutorByGradoSeccion({ grado, seccion, nivel, year })
        // const currentPeriodo = await Calendario.fetchCurrentPeriodo({ nivel, year })

        const pdfDocument = new PdfDocument({ layout: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 }, autoFirstPage: false, size: 'A4' })
        pdfDocument.pipe(res)

        generateLibretaPrimariaPDF({
          notas,
          nivel,
          year,
          grado,
          seccion,
          doc: pdfDocument,
          tutor: tutor.nombreCompleto,
          cursosSalon: cursosSalon!.cursos,
          periodo: undefined,
        })
        pdfDocument.end()
      }
    } catch (err) {
      errorResponseHandler(res, err)
    }
  }

  static async generateLibretasByGradoSeccion(req: Request, res: Response) {
    try {
      const { nivel, year } = extractNivelYearFromHeaders(req)
      const { grado, seccion, estadosMatricula, zipped, excluirAtrasados } = req.body

      assertGrado(grado)
      assertSeccion(seccion)

      const registros = await Documento.getRegistrosByGradoSeccion({ grado, seccion, nivel, year, estadosMatricula, excluirAtrasados })

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
