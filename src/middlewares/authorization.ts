import { HttpError } from '@/libs/HttpError'
import HttpStatusCode from '@/utils/httpStatusCode'
import { NextFunction, Request, Response } from 'express'

export const authorizeRole = (...allowedRole: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRole = req.user?.role
    if (!userRole || !allowedRole.includes(userRole)) {
      throw new HttpError(
        'Forbidden: you dont have any permission',
        HttpStatusCode.NOT_ALLOWED
      )
    }
    next()
  }
}
