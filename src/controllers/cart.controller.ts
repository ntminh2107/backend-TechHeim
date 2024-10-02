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
  const userID = req.user?.id as string
  const { productID } = req.body

  if (!productID)
    throw new HttpError(
      'product not found, pls try again!!!',
      HttpStatusCode.NOT_ALLOWED
    )
  const data = await addToCart(productID, userID)

  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const getCart = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  const data = await getCartUser(userID)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const updateQuantityItm = async (req: Request, res: Response) => {
  const userID = req.user?.id as string
  const cartItemID = req.params.cartItemID
  const { quantity } = req.body
  if (!quantity) {
    throw new HttpError(
      'product or quantity is not valid!!!',
      HttpStatusCode.NOT_FOUND
    )
  }
  const data = await updateQuantity(userID, Number(cartItemID), quantity)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const deleteCartItem = async (req: Request, res: Response) => {
  const userID = req.user?.id as string
  const cartItemID = req.params.cartItemID
  if (!cartItemID)
    throw new HttpError(
      'something wrong with this item, pls try again',
      HttpStatusCode.NOT_ALLOWED
    )

  const data = await deleteItem(userID, Number(cartItemID))
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const deleteCart = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  const data = await deleteAll(userID)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

export { addToCartCtrl, getCart, updateQuantityItm, deleteCartItem, deleteCart }
