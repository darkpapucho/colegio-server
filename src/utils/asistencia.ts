export function getAsistenciaMessage(time: string) {
  const [hour, minute, _] = time.split(':')
  if (Number(hour) >= 7 && Number(minute) >= 45) {
    return 'Felicitaciones! Has llegado a tiempo'
  }
  return 'Has llegado tarde al trabajo'
}
