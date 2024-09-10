import { HttpError } from '@/libs/HttpError'
import HttpStatusCode from '@/utils/httpStatusCode'
import { NextFunction, Request, Response } from 'express'

const isDevelopment = process.env.NODE_ENV !== 'production'

const errorHandler = (
  err: Error | HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status =
    err instanceof HttpError
      ? err.statusCode
      : HttpStatusCode.INTERNAL_SERVER_ERROR

  const message = err.message || 'Internal server error'

  if (isDevelopment) {
    console.error(err)
  } else {
    console.error(message)
  }

  res.status(status).json({
    status,
    message,
    ...(isDevelopment ? { stack: err.stack } : {})
  })
}

export default errorHandler
