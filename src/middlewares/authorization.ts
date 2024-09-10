import { HttpError } from '@/libs/HttpError'
import HttpStatusCode from '@/utils/httpStatusCode'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const verifyJWT = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader?.startsWith('Bearer ')) {
    throw new HttpError('Unauthorized', HttpStatusCode.NOT_FOUND)
  }
  const token = authHeader.split(' ')[1]
  const isCustomAuth = token.length < 500
  let decodedData
  if (token && isCustomAuth) {
    decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_KEY!) as {
      userID: string
    }
    req.user = { id: decodedData.userID }
  }
  return next()
}

export default verifyJWT
