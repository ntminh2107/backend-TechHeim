import { NextFunction, Request, Response } from 'express'

const wrap = <T>(
  callback: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<T> | void
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await callback(req, res, next)
    } catch (error) {
      console.error(error)
      next(error)
    }
  }
}

export default wrap
