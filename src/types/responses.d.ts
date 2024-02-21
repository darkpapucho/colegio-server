// user related types:
export type ResponseOk = {
  ok: true
  payload?: any
}
export type ResponseError = {
  ok: false
  message: string
}
