import { Periodo } from '../../types/alumno'
import { CURSO_SALON } from '../../types/cursos'
import { Grado, Nivel, Seccion, Year } from '../../types/enums'
import { RecordNotas } from '../../types/notas'
import { drawCell } from '../drawCellTable'
import { convertPeriodoKeyToIndex } from '../generarBoletaNotas/utils/utils'

const BEGIN_Y = 130
const BEGIN_X = 50
const HEADER_CELL_WIDTH = 70
const DATA_CELL_WIDTH = 210
const CELL_HEIGHT = 16
const FILL_COLOR = '#8b99c0'
const FONT_SIZE = 9
const FILL_COLOR_BODY = '#8b99c0'
const GRAY_COLOR = '#e4e4e4'
const TEXT_VERTICAL_OFFSET = (cellHeight: number, fontSize: number): number => {
  return cellHeight / 2 - Math.floor(fontSize / 3)
}

export function AddHeaders({
  doc,
  tutor,
  nivel,
  grado,
  seccion,
  year,
  alumno,
}: {
  doc: PDFKit.PDFDocument
  tutor: string
  nivel: Nivel
  grado: Grado
  seccion: Seccion
  year: Year
  alumno: string
}) {
  doc.fontSize(16).text('IEP JESÚS EL NAZARENO', 0, 50, { align: 'center' })
  doc.fontSize(12).text('"Educando con valores"', 0, 70, { align: 'center' })
  doc.fontSize(12).text('LIBRETA DE NOTAS ' + year, 0, 95, { align: 'center' })
  doc.image('./assets/escudo-peruano.png', 25, 35, { width: 50 })
  doc.image('./assets/logo2.png', 520, 35, { width: 50 })
  const data = [
    [
      ['DRE', 'DRE Lima Metropolitana'],
      ['UGEL', 'UGEL 04 Comas'],
    ],
    [
      ['Modalidad', 'EBR'],
      ['Nivel', `${nivel.toUpperCase()}`],
    ],

    [
      ['Grado', `${grado}`],
      ['Sección', `${seccion}`],
    ],

    [
      ['Alumno', `${parseNombreCompleto(alumno, 2)}`],
      ['Tutor', `${parseNombreCompleto(tutor, 3)}`],
    ],
  ]
  let verticalCounter = 0
  for (const row of data) {
    //let horizontalCounter = 0
    for (let i = 0; i < 2; i++) {
      //let dataCounter = 0
      for (let j = 0; j < 2; j++) {
        const distance = calculateHorizontalDistance(i, j)

        drawCell(doc, {
          begin: { x: BEGIN_X - 30 + distance!, y: BEGIN_Y + verticalCounter * CELL_HEIGHT },
          width: j == 0 ? HEADER_CELL_WIDTH : DATA_CELL_WIDTH,
          height: CELL_HEIGHT,
          content: row[i][j],
          options: {
            textVerticalOffSet: TEXT_VERTICAL_OFFSET(CELL_HEIGHT, FONT_SIZE),
            fontSize: FONT_SIZE,
            fillColor: j % 2 == 0 ? FILL_COLOR : '#fff',
            strokeColor: '#000',
            textColor: j % 2 == 0 ? '#fff' : '#000',
            align: j % 2 == 0 ? 'right' : 'left',
            paddingX: 10,
          },
        })
        //horizontalCounter++
        //dataCounter++
      }
    }
    verticalCounter++
  }
}

const HEADERS_HEIGHT = 78
const NOTA_CELL_WIDTH = 32
const NOTA_CELL_HEIGHT = 24
const NOMBRE_CURSO_WIDTH = 180

export function addNotas({ doc, cursosSalon, notas, periodo }: { periodo: Periodo | undefined; doc: PDFKit.PDFDocument; cursosSalon: CURSO_SALON[]; notas: RecordNotas }) {
  //headers
  drawCell(doc, {
    begin: { x: BEGIN_X, y: BEGIN_Y + HEADERS_HEIGHT },
    width: NOMBRE_CURSO_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: 'ASIGNATURA',
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: FILL_COLOR_BODY,
      strokeColor: '#000',
      textColor: '#fff',
      align: 'center',
      paddingX: 10,
    },
  })
  for (let i = 0; i < 5; i++) {
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 2 * i, y: BEGIN_Y + HEADERS_HEIGHT },
      width: NOTA_CELL_WIDTH * 2,
      height: NOTA_CELL_HEIGHT,
      content: i != 4 ? i + 1 + '° BIM' : 'P. Final',
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: FILL_COLOR_BODY,
        strokeColor: '#000',
        textColor: '#fff',
        align: 'center',
        paddingX: 10,
      },
    })
  }
  //nombres de los cursos:
  cursosSalon.forEach((curso, index) => {
    drawCell(doc, {
      begin: { x: BEGIN_X, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (index + 1) },
      width: NOMBRE_CURSO_WIDTH,
      height: NOTA_CELL_HEIGHT,
      content: curso.label.toUpperCase(),
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: FILL_COLOR_BODY,
        strokeColor: '#000',
        textColor: '#fff',
        align: 'center',
        paddingX: 10,
      },
    })
    //notas
    const values = notas.cursos[curso.key]

    values.forEach((value, ix) => {
      drawCell(doc, {
        begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 2 * ix, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (index + 1) },
        width: NOTA_CELL_WIDTH,
        height: NOTA_CELL_HEIGHT,
        content: '' + value,
        options: {
          textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
          fontSize: FONT_SIZE,
          fillColor: '#fff',
          strokeColor: '#000',
          textColor: '#000',
          align: 'center',
          paddingX: 6,
        },
      })
      drawCell(doc, {
        begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * (2 * ix + 1), y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (index + 1) },
        width: NOTA_CELL_WIDTH,
        height: NOTA_CELL_HEIGHT,
        content: convertNumberToLetra(value),
        options: {
          textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
          fontSize: FONT_SIZE,
          fillColor: GRAY_COLOR,
          strokeColor: '#000',
          textColor: '#000',
          align: 'center',
          paddingX: 10,
        },
      })
    })

    //promedios
    const promedio = calcularPromedioNotas(values, periodo)
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 8, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (index + 1) },
      width: NOTA_CELL_WIDTH,
      height: NOTA_CELL_HEIGHT,
      content: '' + promedio,
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: '#fff',
        strokeColor: '#000',
        textColor: '#000',
        align: 'center',
        paddingX: 6,
      },
    })
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 9, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (index + 1) },
      width: NOTA_CELL_WIDTH,
      height: NOTA_CELL_HEIGHT,
      content: convertNumberToLetra(promedio),
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: GRAY_COLOR,
        strokeColor: '#000',
        textColor: '#000',
        align: 'center',
        paddingX: 10,
      },
    })
  })

  //headers bloque final:
  drawCell(doc, {
    begin: { x: BEGIN_X, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 1) + 10 },
    width: NOMBRE_CURSO_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: 'CONDUCTA',
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: FILL_COLOR_BODY,
      strokeColor: '#000',
      textColor: '#fff',
      align: 'center',
      paddingX: 10,
    },
  })
  for (let i = 0; i < 5; i++) {
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 2 * i, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 1) + 10 },
      width: NOTA_CELL_WIDTH * 2,
      height: NOTA_CELL_HEIGHT,
      content: i != 4 ? i + 1 + '° BIM' : 'P. Final',
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: FILL_COLOR_BODY,
        strokeColor: '#000',
        textColor: '#fff',
        align: 'center',
        paddingX: 10,
      },
    })
  }
  //conducta
  drawCell(doc, {
    begin: { x: BEGIN_X, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 2) + 10 },
    width: NOMBRE_CURSO_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: 'DEL ALUMNO',
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: FILL_COLOR_BODY,
      strokeColor: '#000',
      textColor: '#FFF',
      align: 'center',
      paddingX: 6,
    },
  })
  notas.conducta.forEach((nota, ix) => {
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 2 * ix, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 2) + 10 },
      width: NOTA_CELL_WIDTH,
      height: NOTA_CELL_HEIGHT,
      content: '' + nota,
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: '#fff',
        strokeColor: '#000',
        textColor: '#000',
        align: 'center',
        paddingX: 6,
      },
    })
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * (2 * ix + 1), y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 2) + 10 },
      width: NOTA_CELL_WIDTH,
      height: NOTA_CELL_HEIGHT,
      content: convertNumberToLetra(nota),
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: GRAY_COLOR,
        strokeColor: '#000',
        textColor: '#000',
        align: 'center',
        paddingX: 10,
      },
    })
  })
  //promedios conducta:
  const promedioConducta = calcularPromedioNotas(notas.conducta, periodo)
  drawCell(doc, {
    begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 8, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 2) + 10 },
    width: NOTA_CELL_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: '' + promedioConducta,
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: '#fff',
      strokeColor: '#000',
      textColor: '#000',
      align: 'center',
      paddingX: 6,
    },
  })
  drawCell(doc, {
    begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 9, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 2) + 10 },
    width: NOTA_CELL_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: convertNumberToLetra(promedioConducta),
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: GRAY_COLOR,
      strokeColor: '#000',
      textColor: '#000',
      align: 'center',
      paddingX: 10,
    },
  })

  //conducta del PPFF:
  drawCell(doc, {
    begin: { x: BEGIN_X, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 3) + 10 },
    width: NOMBRE_CURSO_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: 'DEL PPFF',
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: FILL_COLOR_BODY,
      strokeColor: '#000',
      textColor: '#FFF',
      align: 'center',
      paddingX: 6,
    },
  })

  notas.conductaPPFF.forEach((nota, ix) => {
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 2 * ix, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 3) + 10 },
      width: NOTA_CELL_WIDTH,
      height: NOTA_CELL_HEIGHT,
      content: '' + nota,
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: '#fff',
        strokeColor: '#000',
        textColor: '#000',
        align: 'center',
        paddingX: 6,
      },
    })
    drawCell(doc, {
      begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * (2 * ix + 1), y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 3) + 10 },
      width: NOTA_CELL_WIDTH,
      height: NOTA_CELL_HEIGHT,
      content: convertNumberToLetra(nota),
      options: {
        textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
        fontSize: FONT_SIZE,
        fillColor: GRAY_COLOR,
        strokeColor: '#000',
        textColor: '#000',
        align: 'center',
        paddingX: 10,
      },
    })
  })

  //promedios conducta PPFF:

  const promedioConductaPPFF = calcularPromedioNotas(notas.conductaPPFF, periodo)
  drawCell(doc, {
    begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 8, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 3) + 10 },
    width: NOTA_CELL_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: '' + promedioConductaPPFF,
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: '#fff',
      strokeColor: '#000',
      textColor: '#000',
      align: 'center',
      paddingX: 6,
    },
  })
  drawCell(doc, {
    begin: { x: BEGIN_X + NOMBRE_CURSO_WIDTH + NOTA_CELL_WIDTH * 9, y: BEGIN_Y + HEADERS_HEIGHT + NOTA_CELL_HEIGHT * (cursosSalon.length + 3) + 10 },
    width: NOTA_CELL_WIDTH,
    height: NOTA_CELL_HEIGHT,
    content: convertNumberToLetra(promedioConductaPPFF),
    options: {
      textVerticalOffSet: TEXT_VERTICAL_OFFSET(NOTA_CELL_HEIGHT, FONT_SIZE),
      fontSize: FONT_SIZE,
      fillColor: GRAY_COLOR,
      strokeColor: '#000',
      textColor: '#000',
      align: 'center',
      paddingX: 10,
    },
  })
}

export function convertNumberToLetra(nota: number) {
  /**
   *  0-10 = C ; 11 - 14 : B ; 15- 17: A, 18 - 20 : AD
   */
  if (nota < 0 || nota > 20) return 'X'
  if (nota > 17 && nota <= 20) {
    return 'AD'
  } else if (nota <= 17 && nota > 14) {
    return 'A'
  } else if (nota <= 14 && nota > 10) {
    return 'B'
  } else {
    return 'C'
  }
}

function calcularPromedioNotas(notas: [number, number, number, number], periodo?: Periodo | undefined) {
  let divisor = 0
  if (periodo) {
    divisor = periodo ? convertPeriodoKeyToIndex(periodo) + 1 : 1
  } else {
    divisor = notas.reduce((acc, row) => {
      if (row != 0) {
        acc += 1
      }
      return acc
    }, 0)
  }
  const promedio = Math.round(notas.reduce((acc, value) => acc + value, 0) / divisor)
  return promedio
}

function calculateHorizontalDistance(i: number, j: number) {
  if (i == 0 && j == 0) {
    return 0
  } else if (i == 0 && j == 1) {
    return HEADER_CELL_WIDTH
  } else if (i == 1 && j == 0) {
    return HEADER_CELL_WIDTH + DATA_CELL_WIDTH
  } else if (i == 1 && j == 1) {
    return HEADER_CELL_WIDTH * 2 + DATA_CELL_WIDTH
  } else {
    return 0
  }
}
function parseNombreCompleto(nombreCompleto: string, numberOfNombres: 1 | 2 | 3): string {
  const [apellidos, nombres] = nombreCompleto.split(', ')
  //si tiene 3 nombres eliminat el tercero

  const [primerNombre, segundoNombre, tercerNombre] = nombres.split(' ')

  let parsed = apellidos + ', ' + primerNombre.substring(0, 1) + primerNombre.substring(1).toLowerCase()
  if (numberOfNombres > 1 && segundoNombre) {
    parsed += ' ' + segundoNombre?.substring(0, 1) + segundoNombre?.substring(1).toLowerCase()
    if (numberOfNombres > 2 && tercerNombre) {
      parsed += ' ' + tercerNombre?.substring(0, 1) + tercerNombre?.substring(1).toLowerCase()
    }
  }
  return parsed
}
