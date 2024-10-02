import { HttpError } from '@/libs/HttpError'
import {
  getOrder,
  insertOrder,
  insertTransaction
} from '@/services/order.service'
import HttpStatusCode from '@/utils/httpStatusCode'
import { Request, Response } from 'express'

const addAnOrder = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  const { addressID } = req.body

  if (!addressID)
    throw new HttpError('address not found', HttpStatusCode.NOT_FOUND)

  const data = insertOrder(userID, addressID)
  return res.status(HttpStatusCode.CREATED).json(data)
}

const getAnOrderDetail = async (req: Request, res: Response) => {
  const userID = req.user?.id as string
  const { orderID } = req.body

  if (!orderID)
    throw new HttpError('order not found!!', HttpStatusCode.NOT_FOUND)

  const data = getOrder(userID, orderID)
  return res.status(HttpStatusCode.ACCEPTED).json(data)
}

const addTransaction = async (req: Request, res: Response) => {
  const userID = req.user?.id as string
  const { orderID, type, deposit } = req.body

  if (!orderID) throw new HttpError('order not found', HttpStatusCode.NOT_FOUND)

  const data = insertTransaction(userID, orderID, type, deposit)
  return res.status(HttpStatusCode.ACCEPTED).json(data)
}

export { getAnOrderDetail, addAnOrder, addTransaction }
