import { HttpError } from '@/libs/HttpError'
import {
  createShipMethod,
  getAllOrders,
  getAllOrdersForAdmin,
  getAllShipMethods,
  getOrder,
  getOrderByAdmin,
  getTopSellingProducts,
  getTransactionByOrderID,
  insertOrder,
  saveTransaction
} from '@/services/order.service'
import stripe from '@/stripe.config'
import { Bill } from '@/types/order'
import HttpStatusCode from '@/utils/httpStatusCode'
import { createInvoice } from '@/utils/pdfInvoiceCreator'
import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'

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
    if (orderDetail.status === 'pending') {
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
        stripeID: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret
      }
      // Attach the payment intent to the response data

      return res.status(HttpStatusCode.ACCEPTED).json(data)
    } else {
      const transaction = await getTransactionByOrderID(orderID)
      const data: Bill = {
        order: orderDetail,
        transaction: transaction
      }
      return res.status(HttpStatusCode.ACCEPTED).json(data)
    }
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

const saveTransactionController = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  const { orderID, stripePaymentIntentID } = req.body

  if (!orderID || !userID || !stripePaymentIntentID) {
    return res.status(400).json({
      error:
        'Missing required parameters: orderID, userID, stripePaymentIntentID'
    })
  }

  try {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      stripePaymentIntentID
    )

    if (!paymentIntent) {
      return res.status(404).json({
        error: `Payment intent with ID ${stripePaymentIntentID} not found`
      })
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment has not been completed successfully.',
        status: paymentIntent.status
      })
    }

    // Extract payment details
    // const amount = paymentIntent.amount / 100 // Convert cents to dollars
    const stripeStatus = paymentIntent.status
    if (stripeStatus === 'succeeded') {
      const orderDetail = await getOrder(userID, orderID)
      if (typeof orderDetail !== 'string' && orderDetail) {
        await createInvoice(orderDetail)
        // fs.writeFileSync(
        //   path.join(__dirname, 'invoices', `${orderDetail.id}.pdf`),
        //   pdfBuffer
        // )

        const receiptURL = `http://localhost:3000/api/order/invoice/${orderID}`
        const amount = paymentIntent.amount / 100

        const transaction = await saveTransaction(
          orderID,
          userID,
          stripePaymentIntentID,
          stripeStatus,
          amount,
          receiptURL
        )
        return res.status(201).json({
          success: true,
          message: 'Transaction saved successfully',
          transaction
        })
      }
    }
  } catch (error) {
    console.error('Error saving transaction:', error)
    return res.status(500).json({
      error: 'An error occurred while saving the transaction.'
    })
  }
}

export const getInvoice = async (req: Request, res: Response) => {
  const { orderId } = req.params

  // Ensure the orderId parameter is provided
  if (!orderId) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      error: 'Order ID is required.'
    })
  }

  try {
    // Build the path to the invoice
    const invoicePath = path.join(`invoices/${orderId}.pdf`)

    // Check if the PDF file exists
    if (!fs.existsSync(invoicePath)) {
      return res.status(HttpStatusCode.NOT_FOUND).json({
        error: 'Invoice not found.'
      })
    }

    // Set the appropriate headers to display the PDF in the browser
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${orderId}.pdf"`)

    // Stream the PDF file to the response
    const fileStream = fs.createReadStream(invoicePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Error serving the invoice:', error)
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: 'An error occurred while retrieving the invoice.'
    })
  }
}

const getAllOrdersController = async (req: Request, res: Response) => {
  const userID = req.user?.id as string

  if (!userID) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      error: 'User ID is required.'
    })
  }

  try {
    // Fetch all orders for the user
    const orders = await getAllOrders(userID)

    // Process orders to include transaction details for successful orders
    const processedOrders = await Promise.all(
      orders.map(async (order) => {
        if (order.status === 'complete') {
          // Fetch transaction details for successful orders
          const transaction = await getTransactionByOrderID(order.id)
          return {
            ...order,
            transaction
          }
        }
        // For non-successful orders, return only the order details
        return order
      })
    )

    // Return the processed orders
    return res.status(HttpStatusCode.OK).json(processedOrders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: 'An error occurred while retrieving orders.'
    })
  }
}

const getBestSellers = async (_req: Request, res: Response) => {
  try {
    const bestSellers = await getTopSellingProducts()
    return res.status(200).json(bestSellers)
  } catch (error) {
    console.error('Error fetching best-sellers:', error)
    return res.status(500).json({ message: 'An error occurred', error })
  }
}

const getAllOrdersForAdminController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10
    const data = await getAllOrdersForAdmin(page, pageSize)
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const getDetailOrderForAdminController = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderID } = req.params
    const data = await getOrderByAdmin(orderID)
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export default getAllOrdersForAdminController

export {
  getAnOrderDetail,
  addAnOrder,
  getShipMethods,
  addShipMethod,
  saveTransactionController,
  getAllOrdersController,
  getBestSellers,
  getAllOrdersForAdminController,
  getDetailOrderForAdminController
}
