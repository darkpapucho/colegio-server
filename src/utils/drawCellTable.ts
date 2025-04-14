export function drawCell(
  document: PDFKit.PDFDocument,
  data: {
    begin: {
      x: number
      y: number
    }
    width: number
    height: number
    content: string
    options?: {
      align?: 'center' | 'justify' | 'left' | 'right'
      fillColor?: PDFKit.Mixins.ColorValue
      strokeColor?: PDFKit.Mixins.ColorValue
      textVerticalOffSet?: number
      fontSize?: number
    }
  },
) {
  const verticalOffSet = data.options?.textVerticalOffSet || 0
  document.rect(data.begin.x, data.begin.y, data.width, data.height).fillAndStroke(data?.options?.fillColor ?? '#FFF', data?.options?.strokeColor ?? '#000')
  document
    .fill('#000')
    .fontSize(data.options?.fontSize || 15)
    .text(data.content, data.begin.x, data.begin.y + verticalOffSet, { width: data.width, align: data?.options?.align })
}
