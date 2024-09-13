import { body } from 'express-validator'

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

export const productValidation = () => {
  return [
    body('price').isDecimal().withMessage('Price is not valid number'),
    body('discount').isBoolean().withMessage('Discount must be true or false')
  ]
}
