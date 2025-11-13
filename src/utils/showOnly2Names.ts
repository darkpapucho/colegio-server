export function showOnly2Names(nombreCompleto: string) {
  const [apellidos, nombres] = nombreCompleto.split(', ')
  const splitNames = nombres.split(' ')

  if (splitNames.length > 2) {
    return apellidos + ', ' + splitNames[0] + ' ' + splitNames[1]
  }
  return nombreCompleto
}
