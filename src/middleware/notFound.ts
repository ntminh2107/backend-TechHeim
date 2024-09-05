import { Request, Response, NextFunction } from 'express'

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404)
  const error = new Error(`this ${req.originalUrl} can not found`)
  next(error)
}

export default notFound
