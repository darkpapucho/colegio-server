import { ExtendedRegistroNota } from '../../types/documents'
import { Nivel, Year } from '../../types/enums'
import { generarBoletasNotasInicial, generarBoletasNotasPrimaria } from './utils/generator'

export default function generarBoletasDeNotas({ registros, document, year, nivel }: { nivel: Nivel; year: Year; document: PDFKit.PDFDocument; registros: ExtendedRegistroNota[] }) {
  if (registros.length === 0) {
    document.text('NO HAY ALUMNOS EN ESTE AÑO/SALÓN', 0, 100, {
      width: 600,
      align: 'center',
    })

    return
  }
  // const libreta = new pdf({
  //   layout: 'portrait',
  //   size: 'A4',
  //   font: 'Courier',
  //   autoFirstPage: false,
  //   margins: { top: 20, left: 20, right: 20, bottom: 20 },
  // });
  // libreta.pipe(fs.createWriteStream('./files/libreta.pdf'));
  // libreta.pipe(res);
  registros.forEach((registro) => {
    document.addPage()
    document.fontSize(14).text(`INFORME DE PROGRESO DEL APRENDIZAJE DEL ESTUDIANTE ${year}`, 0, 30, { width: 600, align: 'center', stroke: true })
    document.image('./assets/logo2.png', 435, 73, { width: 80 })

    if (nivel === 'primaria') {
      generarBoletasNotasPrimaria({ document, registro, nivel })
    } else if (nivel === 'inicial') {
      generarBoletasNotasInicial({ document, registro, nivel })
    }
  })
}
