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

  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'add to cart success',
    data: data
  })
}

const getCart = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  const data = await getCartUser(userID)
  res
    .status(HttpStatusCode.ACCEPTED)
    .json({ message: 'cart detail', data: data })
}

const updateQuantityItm = async (req: Request, res: Response) => {
  const userID = req.user?.id as string
  const { productID, quantity } = req.body
  if (!productID || !quantity) {
    throw new HttpError(
      'product or quantity is not valid!!!',
      HttpStatusCode.NOT_FOUND
    )
  }
  const data = await updateQuantity(userID, productID, quantity)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'product quantity updated success',
    data: data
  })
}

const deleteCartItem = async (req: Request, res: Response) => {
  const userID = req.user?.id as string
  const { productID } = req.body
  if (!productID)
    throw new HttpError(
      'something wrong with this item, pls try again',
      HttpStatusCode.NOT_ALLOWED
    )

  const data = await deleteItem(userID, productID)
  res
    .status(HttpStatusCode.ACCEPTED)
    .json({ message: 'items deleted success', data: data })
}

const deleteCart = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  const data = await deleteAll(userID)
  res
    .status(HttpStatusCode.ACCEPTED)
    .json({ message: 'cart delete success', datas: data })
}

export { addToCartCtrl, getCart, updateQuantityItm, deleteCartItem, deleteCart }
