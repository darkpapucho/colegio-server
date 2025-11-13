export function showOnly2Names(nombreCompleto: string) {
  const [apellidos, nombres] = nombreCompleto.trim().split(',')
  const splitNames = nombres.trim().split(' ')

  if (splitNames.length > 2) {
    return apellidos + ', ' + splitNames[0] + ' ' + splitNames[1]
  }
  return nombreCompleto
}
