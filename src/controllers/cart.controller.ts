import { HttpError } from '@/libs/HttpError'
import {
  addToCart,
  deleteAll,
  deleteItem,
  getCartUser,
  updateQuantity
} from '@/services/cart.service'
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

const updateQuantityItm = async (req: Request, res: Response) => {
  const userID = req.user?.id
  const { productID, quantity } = req.body
  if (!userID || !productID || !quantity) {
    throw new HttpError(
      'something wrong,pls try again',
      HttpStatusCode.NOT_ALLOWED
    )
  }
  const updatedRs = await updateQuantity(userID, productID, quantity)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'product quantity updated success',
    updatedRs: updatedRs
  })
}

const deleteCartItem = async (req: Request, res: Response) => {
  const userID = req.user?.id
  const { productID } = req.body
  if (!userID || !productID)
    throw new HttpError(
      'something wrong,pls try again!!!',
      HttpStatusCode.NOT_ALLOWED
    )

  const rs = await deleteItem(userID, productID)
  res
    .status(HttpStatusCode.ACCEPTED)
    .json({ message: 'items deleted success', result: rs })
}

const deleteCart = async (req: Request, res: Response) => {
  const userID = req.user?.id
  if (!userID)
    throw new HttpError(
      'something wrong,pls try again!!!',
      HttpStatusCode.NOT_ALLOWED
    )

  const rs = await deleteAll(userID)
  res
    .status(HttpStatusCode.ACCEPTED)
    .json({ message: 'cart delete success', result: rs })
}

export { addToCartCtrl, getCart, updateQuantityItm, deleteCartItem, deleteCart }
