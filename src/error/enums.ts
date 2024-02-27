export enum ErrorMessages {
  INVALID_CREDENTIALS = 'invalid credentials',
  INVALID_REQUEST = 'invalid request',
  SERVER_ERROR = "you request couldn't be proccessed, please try again",
  INVALID_TOKEN = 'invalid or corrupted token',
  UNKNOWN_ERROR = 'unknown error',
  OPERATION_NOT_COMPLETED = "the operation couldn't be completed",
  RATIFICACION_MATRICULA_INVALID_AÑO = 'la ratificación de matrícula se limita a los alumnos del año académico pasado',
  RATIFICACION_MATRICULA_INVALID_GRADO = 'la ratificación de matrícula no está disponible para los alumnos de sexto grado',
  INVALID_ALUMNO_DATA = 'los datos de los alumnos no son válidos',
  USER_ALREADY_EXISTS = 'Ya existe un usuario con ese DNI',
}
