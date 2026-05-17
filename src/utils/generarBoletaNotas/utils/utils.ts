import { Periodo } from '../../../types/alumno'
import { CursoNotaRecord, TardanzaInasistencia } from '../../../types/documents'
import { Grado, Nivel, Nota } from '../../../types/enums'
import { ESPACIOS_ENTRE_CURSOS_INICIAL, ESPACIOS_ENTRE_CURSOS_PRIMARIA } from '../../../vars/constants'
import { BOLD_FONT, BORDER_COLOR, FILL_COLOR, HEADER_FONT_COLOR, NORMAL_FONT, NOTA_CELDA_HEIGHT, TEXT_COLOR, TEXT_HEADER } from './vars'

export function convertToLetras(number: number) {
  switch (number) {
    case 1:
      return 'C'
    case 2:
      return 'B'
    case 3:
      return 'A'
    case 4:
      return 'AD'
    case 0:
      return ''
    default:
      throw new Error('ERROR CONVIRTIENDO NUMBERO A LETRA: NOTA INVÁLIDA')
  }
}
function convertToNumbers(letra: Nota | ''): number {
  switch (letra) {
    case 'A':
      return 3
    case 'B':
      return 2
    case 'C':
      return 1
    case 'AD':
      return 4
    case '':
      return 0
    default:
      throw new Error('ERROR CONVIRTIENDO LETRA A NUMERO: NOTA INVÁLIDA')
  }
}

export function calcularPromedioGeneralCurso(subPromedios: (Nota | '')[]) {
  const numeroNotas = subPromedios.length
  const promediosNumeros = subPromedios.map((record) => {
    if (record !== '') return convertToNumbers(record)
    return 0
  })
  const sumaNotas: number = promediosNumeros.reduce((acc, curr) => {
    return acc + curr
  }, 0)
  const promedioAnual = Math.round(sumaNotas / numeroNotas)
  if (!promedioAnual) return ''
  const promedioAnulEnLetra = convertToLetras(Math.round(sumaNotas / numeroNotas))
  return promedioAnulEnLetra
}

export function calcularPromedioCompetencia(curso: CursoNotaRecord) {
  let promedios: (Nota | '')[] = []
  for (let i = 0; i < curso.numCompetencias; i++) {
    let notasCompetencia: number[] = []
    let nota1 = convertToNumbers(curso.primerPeriodo[i])
    let nota2 = convertToNumbers(curso.segundoPeriodo[i])
    let nota3 = convertToNumbers(curso.tercerPeriodo[i])
    let nota4 = convertToNumbers(curso.cuartoPeriodo[i])
    if (nota1 && nota1 !== 0) notasCompetencia.push(nota1)
    if (nota2 && nota1 !== 0) notasCompetencia.push(nota2)
    if (nota3 && nota1 !== 0) notasCompetencia.push(nota3)
    if (nota4 && nota1 !== 0) notasCompetencia.push(nota4)

    if (notasCompetencia.length === 0) {
      promedios.push('')
    } else {
      const sumaNotas = notasCompetencia.reduce((acc, curr) => acc + curr, 0)
      const promedio = Math.round(sumaNotas / notasCompetencia.length)
      promedios.push(convertToLetras(promedio))
    }
  }
  return promedios
}

export function firmas({ document, profesor }: { document: PDFKit.PDFDocument; profesor?: string }) {
  document.fill(TEXT_COLOR).font(NORMAL_FONT)
  if (!profesor) {
    document.moveTo(240, 710).lineTo(360, 710).stroke()
    document.text('Dirección', 240, 716, { width: 120, align: 'center' })
    document.image('./assets/firma.png', 240, 675, { width: 120 })
    document.image('./assets/SELLO.png', 280, 690, { width: 120 })
  } else {
    document.moveTo(180, 710).lineTo(300, 710).stroke()
    document.text('Profesor', 240, 716, { width: 120, align: 'center' })

    document.moveTo(300, 710).lineTo(420, 710).stroke()
    document.text('Dirección', 240, 716, { width: 120, align: 'center' })
    document.image('./assets/firma.png', 300, 675, { width: 120 })
    document.image('./assets/SELLO.png', 340, 690, { width: 120 })
  }
}

export function conclusionesDescriptivasTabla({
  document,
  conclusionesDescriptivas,
}: {
  document: PDFKit.PDFDocument
  conclusionesDescriptivas: [string, string, string, string]
}) {
  // let marginTop = 40;
  // let marginRight = 50;

  document.rect(50, 50, 500, 22).fillOpacity(0.5).fillAndStroke(FILL_COLOR, BORDER_COLOR)
  document.rect(50, 72, 70, 44 * 4).fillAndStroke(FILL_COLOR, BORDER_COLOR)

  document.moveTo(120, 50).lineTo(120, 72).stroke()
  for (let i = 0; i < 4; i++) {
    //PARA CADA PERIODO
    document
      .moveTo(50, 72 + 44 + 44 * i)
      .lineTo(550, 72 + 44 + 44 * i)
      .stroke()
  }

  document
    .moveTo(550, 72)
    .lineTo(550, 72 + 44 * 4)
    .stroke()
  document.fillOpacity(1).fill(TEXT_HEADER).font(BOLD_FONT)
  document.fontSize(9).text('Periodo', 50, 58, { width: 70, align: 'center' })
  document.fontSize(9).text('Conclusión descriptiva del periodo', 120, 58, { width: 420, align: 'center' })
  document.fontSize(12).text('1', 50, 89, { width: 70, align: 'center' })
  document.text('2', 50, 89 + 44, { width: 70, align: 'center' })
  document.text('3', 50, 89 + 89, { width: 70, align: 'center' })
  document.text('4', 50, 89 + 132, { width: 70, align: 'center' })
  let count = 0
  for (const conclusion of conclusionesDescriptivas) {
    const trimmed = conclusion.trim()
    const length = trimmed.length
    let sub = ''
    if (length > 0) {
      sub = trimmed.substring(0, 170)
      if (length > 170) {
        sub = sub + '...'
      }
    }
    console.log({ sub })
    document
      .fillColor('#202020')
      .fontSize(9)
      .text(sub, 124, 78 + count, { width: 422, align: 'left' })
    count += 44
  }
}
export function resumenAsistencias({ document, inasistencias, tardanzas }: { document: PDFKit.PDFDocument; inasistencias: TardanzaInasistencia; tardanzas: TardanzaInasistencia }) {
  document.fill(TEXT_COLOR).font(BOLD_FONT)
  document.fontSize(11).text('Resumen de asistencia del estudiante', 50, 284, { width: 500, align: 'center' })
  document.rect(50, 295, 500, 40).fillOpacity(0.5).fillAndStroke(FILL_COLOR, BORDER_COLOR)
  document.moveTo(120, 315).lineTo(550, 315).stroke() //linea horizontal
  document.moveTo(120, 295).lineTo(120, 335).stroke() //linea vertical
  document
    .moveTo(335, 295)
    .lineTo(335, 335 + 80)
    .stroke()
  document
    .moveTo(120 + 215 / 2, 315)
    .lineTo(120 + 215 / 2, 335 + 80)
    .stroke()
  document
    .moveTo(120 + 215 + 215 / 2, 315)
    .lineTo(120 + 215 + 215 / 2, 335 + 80)
    .stroke()
  document.rect(50, 335, 70, 80).fillAndStroke(FILL_COLOR, BORDER_COLOR)
  //lineas horizontales
  document
    .moveTo(50, 335 + 20)
    .lineTo(550, 335 + 20)
    .stroke()
  document
    .moveTo(50, 335 + 40)
    .lineTo(550, 335 + 40)
    .stroke()
  document
    .moveTo(50, 335 + 60)
    .lineTo(550, 335 + 60)
    .stroke()
  document
    .moveTo(50, 335 + 80)
    .lineTo(550, 335 + 80)
    .stroke()
  document
    .moveTo(550, 335)
    .lineTo(550, 335 + 80)
    .stroke()
  //textos

  document.fillOpacity(1).fill(HEADER_FONT_COLOR).fontSize(9).font(BOLD_FONT)
  document.text('Periodo', 50, 312, { width: 70, align: 'center' })
  document.text('Inasistencias', 120, 302, { width: 215, align: 'center' })
  document.text('Tardanzas', 120 + 215, 302, { width: 215, align: 'center' })
  document.text('Justificadas', 120, 302 + 20, { width: 215 / 2, align: 'center' })
  document.text('Injustificadas', 120 + 215 / 2, 302 + 20, { width: 215 / 2, align: 'center' })
  document.text('Justificadas', 120 + 215, 302 + 20, { width: 215 / 2, align: 'center' })
  document.text('Injustificadas', 120 + 215 + 215 / 2, 302 + 20, { width: 215 / 2, align: 'center' })
  document.text('1', 50, 342, { width: 70, align: 'center' })
  document.text('2', 50, 342 + 20, { width: 70, align: 'center' })
  document.text('3', 50, 342 + 40, { width: 70, align: 'center' })
  document.text('4', 50, 342 + 60, { width: 70, align: 'center' })

  //llenado de datos
  document.font(NORMAL_FONT).fill(TEXT_COLOR)
  let count = 0
  const FIELD_HEIGHT = 20
  for (let inasistencia of inasistencias.justificadas) {
    document.text(inasistencia === 0 ? '-' : '' + inasistencia, 120, 342 + count, { width: 215 / 2, align: 'center' })
    count += FIELD_HEIGHT
  }
  count = 0
  for (let inasistencia of inasistencias.injustificadas) {
    document.text(inasistencia === 0 ? '-' : '' + inasistencia, 120 + 215 / 2, 342 + count, { width: 215 / 2, align: 'center' })
    count += FIELD_HEIGHT
  }
  count = 0
  for (let tardanza of tardanzas.justificadas) {
    document.text(tardanza == 0 ? '-' : '' + tardanza, 120 + 215, 342 + count, { width: 215 / 2, align: 'center' })
    count += FIELD_HEIGHT
  }
  count = 0
  for (let tardanza of tardanzas.injustificadas) {
    document.text(tardanza == 0 ? '-' : '' + tardanza, 120 + 215 + 215 / 2, 342 + count, { width: 215 / 2, align: 'center' })
    count += FIELD_HEIGHT
  }
}
export function escalaCalificaciones(document: PDFKit.PDFDocument) {
  document.fill(TEXT_COLOR).font(BOLD_FONT)
  document.text('Escala de calificaciones del CNEB', 50, 434, { width: 500, align: 'center' })
  document
    .rect(50, 445, 70, 44 * 4 + 11)
    .fillOpacity(0.5)
    .fillAndStroke(FILL_COLOR, BORDER_COLOR)
  document.moveTo(50, 445).lineTo(550, 445).stroke()
  document
    .moveTo(50, 445 + 44)
    .lineTo(550, 445 + 44)
    .stroke()
  document
    .moveTo(50, 445 + 88)
    .lineTo(550, 445 + 88)
    .stroke()
  document
    .moveTo(50, 445 + 132)
    .lineTo(550, 445 + 132)
    .stroke()
  document
    .moveTo(50, 445 + 176 + 11)
    .lineTo(550, 445 + 176 + 11)
    .stroke()
  document
    .moveTo(550, 445)
    .lineTo(550, 445 + 176 + 11)
    .stroke()
  document.fillOpacity(1).fill(HEADER_FONT_COLOR).fontSize(11).font(BOLD_FONT)
  document.text('AD', 50, 464, { width: 70, align: 'center' })
  document.text('A', 50, 464 + 44, { width: 70, align: 'center' })
  document.text('B', 50, 464 + 88, { width: 70, align: 'center' })
  document.text('C', 50, 464 + 132 + 5, { width: 70, align: 'center' })
  //descripciones

  document.fontSize(9).fill(TEXT_COLOR).font(NORMAL_FONT)
  document.text(
    `Logro destacado.
  Cuando el estudiante evidencia un nivel superior a lo esperado respecto a la competencia. Esto quiere decir que demuestra aprendizajes que van más allá del nivel esperado.`,
    126,
    449,
    { width: 418, align: 'justify' },
  )
  document.fontSize(9).text(
    `Logro esperado.
  Cuando el estudiante evidencia el nivel esperado respecto a la competencia, demostrando manejo satisfactorio en todas las tareas propuestas y en el tiempo programado.`,
    126,
    449 + 44,
    { width: 418, align: 'justify' },
  )
  document.fontSize(9).text(
    `En proceso.
  Cuando el estudiante está proximo o cerca al nivel esperado respecto a la competencia, para lo cual require acompañamiento durante un tiempo razonable para lograrlo.`,
    126,
    449 + 88,
    { width: 418, align: 'justify' },
  )
  document.fontSize(9).text(
    `En inicio.
  Cuando el estudiante muestra un progreso mínimo en una competencia de acuerdo al nivel esperado. Evidencia con frecuencia dificultades en el desarrollo de las tareas, por lo que necesita mayor tiempo de acompañamiento e intervención del docente.`,
    126,
    449 + 132,
    { width: 418, align: 'justify' },
  )
}

export function tablaNotasPromedios({ document, cursos, nivel, grado }: { document: PDFKit.PDFDocument; cursos: { [key: string]: CursoNotaRecord }; nivel: Nivel; grado: Grado }) {
  //inicial
  document.fill(TEXT_COLOR).font(NORMAL_FONT)
  if (nivel === 'primaria') {
    let count = 0
    for (let curso in cursos) {
      const promedios = calcularPromedioCompetencia(cursos[curso])

      const promedioAnual = calcularPromedioGeneralCurso(promedios)

      document.text(promedioAnual, 495, 230 + ESPACIOS_ENTRE_CURSOS_PRIMARIA[curso], { width: 55, align: 'center' })
      document.text(promedioAnual, 465, 230 + ESPACIOS_ENTRE_CURSOS_PRIMARIA[curso], { width: 30, align: 'center' })
      const rows = promedios.length
      for (let i = 0; i < rows; i++) {
        document.fontSize(9).text(promedios[i], 435, 237 + count, { width: 30, align: 'center' })
        count += NOTA_CELDA_HEIGHT
      }
    }
  } else if (nivel === 'inicial') {
    if (grado === 'Grupo 5 años') {
      let count = 0
      for (let curso in cursos) {
        const promedios = calcularPromedioCompetencia(cursos[curso])
        const promedioAnual = calcularPromedioGeneralCurso(promedios) //vamos aqu9 ok
        document.text(promedioAnual, 495, 230 + ESPACIOS_ENTRE_CURSOS_INICIAL[curso], { width: 55, align: 'center' })
        document.text(promedioAnual, 465, 230 + ESPACIOS_ENTRE_CURSOS_INICIAL[curso], { width: 30, align: 'center' })

        const rows = promedios.length
        for (let i = 0; i < rows; i++) {
          document.fontSize(9).text(promedios[i], 435, 237 + count, { width: 30, align: 'center' })
          count += NOTA_CELDA_HEIGHT
        }
      }
    } else {
      let count = 0
      for (let curso in cursos) {
        const promedios = calcularPromedioCompetencia(cursos[curso])
        const promedioAnual = calcularPromedioGeneralCurso(promedios)
        document.text(promedioAnual, 495, 230 + ESPACIOS_ENTRE_CURSOS_INICIAL[curso], { width: 55, align: 'center' })
        document.text(promedioAnual, 465, 230 + ESPACIOS_ENTRE_CURSOS_INICIAL[curso], { width: 30, align: 'center' })

        const rows = promedios.length
        for (let i = 0; i < rows; i++) {
          document.fontSize(9).text(promedios[i], 435, 237 + count, { width: 30, align: 'center' })
          count += NOTA_CELDA_HEIGHT
        }
      }
    }
  }
}

export function convertPeriodoKeyToIndex(periodo: keyof Omit<CursoNotaRecord, 'numCompetencias'>): number {
  switch (periodo) {
    case 'primerPeriodo':
      return 0
    case 'segundoPeriodo':
      return 1
    case 'tercerPeriodo':
      return 2
    case 'cuartoPeriodo':
      return 3
    default:
      return 0
  }
}

export function convertPeriodoKeyToName(periodo: Periodo) {
  switch (periodo) {
    case 'cuartoPeriodo':
      return 'cuarto periodo'
    case 'primerPeriodo':
      return 'primer periodo'
    case 'segundoPeriodo':
      return 'segundo periodo'
    case 'tercerPeriodo':
      return 'tercer periodo'
    default:
      return 'PERIODO INVÁLIDO'
  }
}
