import { HttpError } from '@/libs/HttpError'
import { addToCart, getCartUser } from '@/services/cart.service'
import HttpStatusCode from '@/utils/httpStatusCode'
import { Request, Response } from 'express'

const addToCartCtrl = async (req: Request, res: Response) => {
  const userID = req.user?.id
  const { productID } = req.body

  if (!userID || !productID)
    throw new HttpError(
      'something wrong,pls try again',
      HttpStatusCode.NOT_ALLOWED
    )
  const newCart = await addToCart(productID, userID)

  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'add to cart success',
    newCart
  })
}

const getCart = async (req: Request, res: Response) => {
  const userID = req.user?.id
  if (!userID)
    throw new HttpError(
      'something wrong,pls try again',
      HttpStatusCode.NOT_ALLOWED
    )
  const getCart = await getCartUser(userID)
  res.status(HttpStatusCode.ACCEPTED).json({ message: 'cart detail', getCart })
}

export { addToCartCtrl, getCart }
