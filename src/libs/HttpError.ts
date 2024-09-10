export class HttpError extends Error {
  public isHttpError: boolean
  public statusCode: number

  constructor(message = 'Internal Server Error', status = 500) {
    super(message)
    this.isHttpError = true
    this.statusCode = status
  }
}
