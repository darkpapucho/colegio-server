export function calcularPonderado(cursos: { [curso: string]: [number, number, number, number] }): number {
  const promedios: number[] = []
  for (let curso in cursos) {
    promedios.push(calcularPromedioCurso(cursos[curso]))
  }
  // promedios.push(calcularPromedioCurso(conducta))
  const ponderado = +(promedios.reduce((acc, curr) => acc + curr, 0) / promedios.length).toFixed(2)
  return ponderado
}

export function calcularPromedioCurso(notas: [number, number, number, number]): number {
  const numPeriodos = notas.reduce((acc, curr) => {
    if (curr != 0) {
      acc++
    }
    return acc
  }, 0)
  if (!numPeriodos) return 0
  return +((notas[0] + notas[1] + notas[2] + notas[3]) / numPeriodos).toFixed(2)
}
