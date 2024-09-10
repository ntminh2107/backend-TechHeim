import { validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express'

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    next()
  }
  const extractedErrors: Object[] = []

  errors.array().forEach((err) => {
    if ('param' in err) {
      // Type guard to check if 'param' exists in 'err'
      extractedErrors.push({ [err.param as string]: err.msg })
    }
  })
  return res.status(422).json({
    errors: extractedErrors
  })
}

export default validate
