import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'

export const loginValidation = () => {
  return [
    body('email')
      .isEmail()
      .withMessage('Email is not in valid type')
      .trim()
      .escape(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('password at least 8 character')
      .trim()
      .escape()
  ]
}

export const registerValidation = () => {
  return [
    body('email').isEmail().withMessage('Email is not in valid type'),
    body('password')
      .isLength({ min: 8 })
      .withMessage(
        'Password should have at least: eigth characters, one upper case character, one lower case character and one number.'
      )
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minSymbols: 0,
        minNumbers: 1,
        minUppercase: 1
      })
  ]
}

export const validate = (req: Request, res: Response, next: NextFunction) => {
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
