import { HttpError } from '@/libs/HttpError'
import {
  createShipMethod,
  getAllShipMethods,
  getOrder,
  insertOrder
} from '@/services/order.service'
import stripe from '@/stripe.config'
import HttpStatusCode from '@/utils/httpStatusCode'
import { Request, Response } from 'express'

const addAnOrder = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  const { addressID, shipMethodID } = req.body

  console.log(addressID, shipMethodID)

  if (!addressID)
    throw new HttpError('address not found', HttpStatusCode.NOT_FOUND)

  const data = await insertOrder(userID, addressID, shipMethodID)
  return res.status(HttpStatusCode.CREATED).json(data)
}

const getAnOrderDetail = async (req: Request, res: Response) => {
  const userID = req.user?.id as string
  const { orderID } = req.params

  console.log('orderID: ', orderID) // Ensure this logs the correct ID

  if (!orderID)
    throw new HttpError('order not found!!', HttpStatusCode.NOT_FOUND)

  // Fetch the order details
  const orderDetail = await getOrder(userID, orderID)

  // Check if `totalPrice` exists
  if (typeof orderDetail === 'string') {
    throw new HttpError(
      'Order not found: ' + orderDetail,
      HttpStatusCode.BAD_REQUEST
    )
  }

  try {
    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orderDetail.total * 100), // Convert to smallest currency unit (e.g., cents)
      currency: 'usd', // Adjust the currency if needed
      metadata: {
        orderID,
        userID
      }
    })

    const data: any = {
      orderDetail,
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    }
    // Attach the payment intent to the response data

    return res.status(HttpStatusCode.ACCEPTED).json(data)
  } catch (error) {
    console.error('Stripe Payment Intent Error:', error)
    throw new HttpError(
      'Failed to create payment',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )
  }
}

const addShipMethod = async (req: Request, res: Response) => {
  const { method, detail, price } = req.body
  const data = await createShipMethod(method, detail, price)
  return res.status(HttpStatusCode.ACCEPTED).json(data)
}

const getShipMethods = async (_req: Request, res: Response) => {
  const data = await getAllShipMethods()
  return res.status(HttpStatusCode.ACCEPTED).json(data)
}

export { getAnOrderDetail, addAnOrder, getShipMethods, addShipMethod }
