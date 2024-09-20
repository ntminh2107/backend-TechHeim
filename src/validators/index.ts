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
    body('name')
      .exists()
      .withMessage('product name must be required')
      .isString()
      .withMessage('product name is not valid'),
    body('image')
      .exists()
      .withMessage('product image must be required')
      .isString()
      .withMessage('product image is not valid'),
    body('color')
      .exists()
      .withMessage('product color must be required')
      .isString()
      .withMessage('product color is not valid'),
    body('category')
      .exists()
      .withMessage('product category must be required')
      .isString()
      .withMessage('product category is not valid'),
    body('brand')
      .exists()
      .withMessage('product brand must be required')
      .isString()
      .withMessage('product brand is not valid'),
    body('price').isFloat().withMessage('Price is not valid number'),
    body('salePrice').isFloat().withMessage('sale price is not valid number'),
    body('discount').isBoolean().withMessage('Discount must be true or false')
  ]
}

export const deleteCartItemValidation = () => {
  return [body('productID').exists().withMessage('productId must be required')]
}

export const addToCartValidation = () => {
  return [body('productID').exists().withMessage('productId must be required')]
}

export const updateQuantityValidation = () => {
  return [
    body('productID').exists().withMessage('productId must be required'),
    body('quantity')
      .exists()
      .withMessage('quantity must be required')
      .isInt()
      .withMessage('quantity must be a number')
  ]
}

export const orderValidation = () => {
  return [body('addressID').exists().withMessage('addressID must be required')]
}

export const transactionValidation = () => {
  return [
    body('orderID').exists().withMessage('orderID must be required'),
    body('type')
      .exists()
      .withMessage('type must be required')
      .isIn(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'])
      .withMessage('type does contain invalid value'),
    body('deposit')
      .exists()
      .withMessage('deposit value must be required')
      .isFloat()
      .withMessage('deposit value must be a valid number')
  ]
}
