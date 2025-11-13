export function convertToLocalDatePeru(date: string | Date | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
