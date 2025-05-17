import { ClientSession, ObjectId } from 'mongodb'

import { mongoClient } from '../db'
import { EstadoMatricula, Grado, Nivel, Seccion, Year } from '../types/enums'
import { QueryProfesor, QueryTutor, RecordNotas } from '../types/notas'
import { CURSO_SALON } from '../types/cursos'
export default class Notas {
  static async updateCursosFieldsByAlumnosId({
    //actualiza los campos de los cursos a evaluar por salon en notas$[nivel}${year}
    alumnosId,
    cursosKey,
    session,
    nivel,
    year,
  }: {
    nivel: Nivel
    year: Year
    alumnosId: ObjectId[]
    cursosKey: string[]
    session?: ClientSession
  }) {
    const cursos = Object.fromEntries(cursosKey.map((curso) => [curso, [0, 0, 0, 0]]))

    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .updateMany({ alumnoId: { $in: [...alumnosId] } }, { $set: { cursos } }, { session })

    return response
  }
  static async getNotasByGradoSeccion({
    nivel,
    year,
    grado,
    seccion,
    estadosMatricula,
  }: {
    estadosMatricula?: EstadoMatricula[]
    nivel: Nivel
    year: Year
    grado: Grado
    seccion: Seccion
  }) {
    const cursor = mongoClient
      .db()
      .collection(`matriculados${nivel}${year}`)
      .aggregate<RecordNotas>([
        { $match: { grado, seccion, estadoMatricula: { $in: estadosMatricula ? estadosMatricula : ['DEFINITIVA', 'EN PROCESO'] } } },
        { $project: { alumno: '$nombreCompleto', _id: 1, estadoMatricula: 1 } },
        { $lookup: { from: `notas${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'record' } },
        { $project: { alumno: 1, estadoMatricula: 1, record: { $arrayElemAt: ['$record', 0] } } },
        {
          $project: {
            _id: 0,
            alumno: 1,
            estadoMatricula: 1,
            alumnoId: '$record.alumnoId',
            tardanzas: '$record.tardanzas',
            inasistencias: '$record.inasistencias',
            conclusionesDescriptivas: '$record.conclusionesDescriptivas',
            cursos: '$record.cursos',
            conducta: '$record.conducta',
            conductaPPFF: '$record.conductaPPFF',
          },
        },
        { $sort: { alumno: 1 } },
      ])
    const result: RecordNotas[] = []
    for await (const doc of cursor) {
      result.push(doc)
    }

    return result
  }
  static async getNotasByGradoSeccionFromCursosProfesor({
    nivel,
    year,
    grado,
    seccion,
    estadosMatricula,
    isTutor,
    cursosQuery,
  }: {
    estadosMatricula?: EstadoMatricula[]
    nivel: Nivel
    year: Year
    grado: Grado
    seccion: Seccion
    isTutor: boolean
    cursosQuery: { [key: string]: 1 | 0 }
  }) {
    if (isTutor) {
      const cursor = mongoClient
        .db()
        .collection(`matriculados${nivel}${year}`)
        .aggregate<RecordNotas>([
          { $match: { grado, seccion, estadoMatricula: { $in: estadosMatricula ? estadosMatricula : ['DEFINITIVA', 'EN PROCESO'] } } },
          { $project: { alumno: '$nombreCompleto', _id: 1, estadoMatricula: 1 } },
          { $lookup: { from: `notas${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'record' } },
          { $project: { alumno: 1, estadoMatricula: 1, record: { $arrayElemAt: ['$record', 0] } } },
          {
            $project: {
              _id: 0,
              alumno: 1,
              estadoMatricula: 1,
              alumnoId: '$record.alumnoId',
              tardanzas: '$record.tardanzas',
              inasistencias: '$record.inasistencias',
              conclusionesDescriptivas: '$record.conclusionesDescriptivas',
              conducta: '$record.conducta',
              conductaPPFF: '$record.conductaPPFF',
              cursos: '$record.cursos',
            },
          },
          {
            $project: {
              alumno: 1,

              alumnoId: 1,
              tardanzas: 1,
              inasistencias: 1,
              conclusionesDescriptivas: 1,
              conducta: 1,
              conductaPPFF: 1,
              cursos: cursosQuery,
            },
          },
          { $sort: { alumno: 1 } },
        ])
      const result: RecordNotas[] = []
      for await (const doc of cursor) {
        result.push(doc)
      }

      return result
    } else {
      const cursor = mongoClient
        .db()
        .collection(`matriculados${nivel}${year}`)
        .aggregate<RecordNotas>([
          { $match: { grado, seccion, estadoMatricula: { $in: estadosMatricula ? estadosMatricula : ['DEFINITIVA', 'EN PROCESO'] } } },
          { $project: { alumno: '$nombreCompleto', _id: 1, estadoMatricula: 1 } },
          { $lookup: { from: `notas${nivel}${year}`, localField: '_id', foreignField: 'alumnoId', as: 'record' } },
          { $project: { alumno: 1, estadoMatricula: 1, record: { $arrayElemAt: ['$record', 0] } } },
          {
            $project: {
              _id: 0,
              alumno: 1,
              estadoMatricula: 1,
              alumnoId: '$record.alumnoId',
              cursos: '$record.cursos',
            },
          },
          {
            $project: {
              alumno: 1,
              alumnoId: 1,
              cursos: cursosQuery,
            },
          },
          { $sort: { alumno: 1 } },
        ])
      const result: RecordNotas[] = []
      for await (const doc of cursor) {
        result.push(doc)
      }

      return result
    }
  }
  static async updateRecordNotasByTeacher({
    nivel,
    year,
    registro,
    isTutor,
    cursosProfesor,
  }: {
    cursosProfesor: CURSO_SALON[]
    nivel: Nivel
    year: Year
    registro: RecordNotas[]
    isTutor: boolean
  }) {
    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .bulkWrite(
        registro.map((row) => {
          const cursosQuery: QueryProfesor = Object.fromEntries(
            cursosProfesor.map((cursoSalon: CURSO_SALON) => {
              const notas = row.cursos[cursoSalon.key]
              return [`cursos.${cursoSalon.key}`, notas]
            }),
          )
          const tutorQuery: QueryTutor = {}
          if (isTutor) {
            tutorQuery['inasistencias'] = row.inasistencias
            tutorQuery['tardanzas'] = row.tardanzas
            tutorQuery['conducta'] = row.conducta
            tutorQuery['conductaPPFF'] = row.conductaPPFF
            tutorQuery['conclusionesDescriptivas'] = row.conclusionesDescriptivas
          }
          return {
            updateOne: {
              filter: { alumnoId: new ObjectId(row.alumnoId) },
              update: {
                $set: {
                  ...tutorQuery,
                  ...cursosQuery,
                },
              },
            },
          }
        }),
        { ordered: false },
      )
    return response
  }
  static async updateRecordNotasPrimaria({ nivel, year, registro }: { nivel: Nivel; year: Year; registro: RecordNotas[] }) {
    const response = await mongoClient
      .db()
      .collection(`notas${nivel}${year}`)
      .bulkWrite(
        registro.map((row) => {
          const cursosQuery = Object.fromEntries(
            Object.keys(row.cursos).map((cursoKey: string) => {
              const notas = row.cursos[cursoKey]
              return [`cursos.${cursoKey}`, notas]
            }),
          )

          return {
            updateOne: {
              filter: { alumnoId: new ObjectId(row.alumnoId) },
              update: {
                $set: {
                  inasistencias: row.inasistencias,
                  tardanzas: row.tardanzas,
                  conducta: row.conducta,
                  conductaPPFF: row.conductaPPFF,
                  conclusionesDescriptivas: row.conclusionesDescriptivas,
                  ...cursosQuery,
                },
              },
            },
          }
        }),
        { ordered: false },
      )
    return response
  }
}
