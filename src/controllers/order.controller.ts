import { HttpError } from '@/libs/HttpError'
import {
  getOrder,
  insertOrder,
  insertTransaction
} from '@/services/order.service'
import HttpStatusCode from '@/utils/httpStatusCode'
import { Request, Response } from 'express'

const addAnOrder = async (req: Request, res: Response) => {
  const userID = req.user?.id

  const { addressID } = req.body

  if (!userID || !addressID)
    throw new HttpError('something went wrong!!', HttpStatusCode.NOT_ALLOWED)

  const rs = insertOrder(userID, addressID)
  return res.status(HttpStatusCode.CREATED).json({
    message: 'created success!!!',
    result: rs
  })
}

const getAnOrder = async (req: Request, res: Response) => {
  const userID = req.user?.id
  const { orderID } = req.body

  if (!userID || !orderID)
    throw new HttpError('something went wrong!!', HttpStatusCode.NOT_ALLOWED)

  const rs = getOrder(userID, orderID)
  return res.status(HttpStatusCode.ACCEPTED).json({
    message: `get an order with id :${orderID} success!!!`,
    order: rs
  })
}

const doTransaction = async (req: Request, res: Response) => {
  const userID = req.user?.id
  const { orderID, type, deposit } = req.body

  if (!userID || !orderID)
    throw new HttpError('something went wrong!!', HttpStatusCode.NOT_ALLOWED)

  const rs = insertTransaction(userID, orderID, type, deposit)
  return res.status(HttpStatusCode.ACCEPTED).json({
    message: `transaction complete with order: ${orderID} success!!!`,
    transaction: rs
  })
}

export { getAnOrder, addAnOrder, doTransaction }
