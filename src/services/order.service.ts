import { getDbClient } from '@/database/connection'
import { tblCarts, tblCartItems } from '@/models/cart.schema'
import {
  tblOrderItems,
  tblOrders,
  tblShipMethod,
  tblTransactions
} from '@/models/order.schema'
import { tblProducts } from '@/models/product.schema'
import { tblAddresses, tblUsers } from '@/models/user.schema'
import { Order, OrderItems, ShipMethod, Transaction } from '@/types/order'
import { Address } from '@/types/user'
import { and, eq, sql } from 'drizzle-orm'
import { findUserByID } from './auth.service'

export const insertOrder = async (
  userID: string,
  addressID: number,
  shipMethodID: number
): Promise<Order> => {
  const db = getDbClient()

  // Check if the user has a cart
  const checkCart = await db
    .select()
    .from(tblCarts)
    .where(eq(tblCarts.userID, userID))
    .limit(1)
    .then((rows) => rows[0])
  if (!checkCart) throw new Error('Something wrong happened')

  return await db.transaction(async (trx) => {
    // Insert order
    const insertOrder = await trx
      .insert(tblOrders)
      .values({ userID, addressID, shipMethodID })
      .returning()

    if (!insertOrder) throw new Error('Something wrong happened')

    const orderID = insertOrder[0].id

    // Fetch cart items
    const cartItemRs = await trx
      .select()
      .from(tblCartItems)
      .where(eq(tblCartItems.cartID, checkCart.id))

    if (cartItemRs.length === 0 || !cartItemRs) {
      throw new Error(
        'Don’t have any items in your cart! Please choose items before ordering'
      )
    }

    let totalOrder = 0

    // Prepare order items
    const orderItems = cartItemRs.map((item) => {
      const quantity = Number(item.quantity)
      const price = Number(item.price)

      // Validate quantity and price
      if (!quantity || !price) {
        throw new Error(
          `Invalid item detected in cart: Product ID ${item.productID}, quantity: ${quantity}, price: ${price}`
        )
      }

      const total = quantity * price // Total price for this item
      totalOrder += total

      return {
        orderID,
        productID: item.productID as number,
        quantity,
        price: price.toString() // Store the unit price
      }
    })

    // Insert order items
    await trx.insert(tblOrderItems).values(orderItems).returning()

    // Fetch shipping method and calculate total
    const shippingMethod = await trx
      .select()
      .from(tblShipMethod)
      .where(eq(tblShipMethod.id, shipMethodID))
      .limit(1)
      .then((rows) => rows[0])

    if (!shippingMethod) throw new Error('Invalid shipping method selected')

    const shippingPrice = Number(shippingMethod.price)
    totalOrder += shippingPrice

    // Update order total
    await trx
      .update(tblOrders)
      .set({ total: totalOrder.toString() })
      .where(eq(tblOrders.id, orderID))

    // Fetch the complete order details
    const orderRs = await trx
      .select({
        id: tblOrders.id,
        userID: tblOrders.userID,
        status: tblOrders.status,
        total: tblOrders.total,
        createdAt: tblOrders.createdAt,
        updatedAt: tblOrders.updatedAt
      })
      .from(tblOrders)
      .where(eq(tblOrders.id, orderID))
      .limit(1)
      .then((rows) => rows[0])

    if (!orderRs) throw new Error('Order retrieval failed')

    // Fetch address details
    const addressRs = await trx
      .select({
        id: tblAddresses.id,
        fullname: tblAddresses.fullname,
        address: tblAddresses.address,
        city: tblAddresses.city,
        country: tblAddresses.country
      })
      .from(tblAddresses)
      .where(eq(tblAddresses.id, addressID))
      .limit(1)
      .then((rows) => rows[0])

    if (!addressRs) throw new Error('Address retrieval failed')

    // Fetch order items
    const orderItemsRs = await trx
      .select({
        id: tblOrderItems.id,
        name: tblProducts.name,
        image: tblProducts.image,
        quantity: tblOrderItems.quantity,
        price: tblOrderItems.price
      })
      .from(tblOrderItems)
      .leftJoin(tblProducts, eq(tblProducts.id, tblOrderItems.productID))
      .where(eq(tblOrderItems.orderID, orderID))

    const orderItemsObj = orderItemsRs.map((item) => ({
      ...item,
      price: Number(item.price)
    }))

    // Assemble the result
    const result: Order = {
      id: orderRs.id,
      userID: orderRs.userID as string,
      address: addressRs as Address,
      status: orderRs.status as string,
      shipMethod: {
        id: shippingMethod.id,
        method: shippingMethod.method as string,
        detail: shippingMethod.detail as string,
        price: Number(shippingMethod.price)
      },
      orderItems: orderItemsObj as OrderItems[],
      total: Number(orderRs.total),
      createdAt: orderRs.createdAt,
      updatedAt: orderRs.updatedAt
    }

    return result
  })
}
/*TODO: GET order + do transaction w/ noti */
export const getOrder = async (
  userID: string,
  orderID: string
): Promise<Order | string> => {
  console.log('userID: ', userID, 'orderID: ', orderID)
  const db = getDbClient()
  const orderRs = await db
    .select()
    .from(tblOrders)
    .leftJoin(tblUsers, eq(tblUsers.id, tblOrders.userID))
    .where(and(eq(tblUsers.id, userID), eq(tblOrders.id, orderID)))
    .limit(1)
    .then((rows) => rows[0])

  if (!orderRs) throw new Error('no order found!!!')

  const shipMethodRs = await db
    .select()
    .from(tblShipMethod)
    .where(eq(tblShipMethod.id, orderRs.orders.shipMethodID as number))
    .limit(1)
    .then((rows) => rows[0])

  const selectedShipMethod: ShipMethod = {
    id: shipMethodRs.id,
    method: shipMethodRs.method as string,
    detail: shipMethodRs.detail as string,
    price: Number(shipMethodRs.price)
  }

  const addressRs = await db
    .select({
      id: tblAddresses.id,
      fullname: tblAddresses.fullname,
      phoneNumber: tblAddresses.phoneNumber,
      district: tblAddresses.district,
      address: tblAddresses.address,
      city: tblAddresses.city,
      country: tblAddresses.country
    })
    .from(tblAddresses)
    .where(eq(tblAddresses.id, orderRs.orders.addressID as number))
    .limit(1)
    .then((rows) => rows[0])

  const orderItemsRs = await db
    .select({
      id: tblOrderItems.id,
      name: tblProducts.name,
      image: tblProducts.image,
      quantity: tblOrderItems.quantity,
      price: tblOrderItems.price
    })
    .from(tblOrderItems)
    .leftJoin(tblProducts, eq(tblProducts.id, tblOrderItems.productID))
    .where(eq(tblOrderItems.orderID, orderRs.orders.id as string))

  const orderItemsObj = orderItemsRs.map((item) => ({
    ...item,
    price: Number(item.price)
  }))

  let transaction: Transaction | undefined = undefined

  if (orderRs.orders.status === 'complete') {
    const transactionData = await db
      .select()
      .from(tblTransactions)
      .where(eq(tblTransactions.orderID, orderRs.orders.id))
      .limit(1)
      .then((rows) => rows[0])
    if (transactionData) {
      transaction = {
        id: transactionData.id,
        orderID: transactionData.orderID as string,
        userID: transactionData.userID as string,
        stripePaymentIntentID: transactionData.stripePaymentIntentID as string,
        stripeStatus: transactionData.stripeStatus as string,
        amount: Number(transactionData.amount),
        currency: transactionData.currency as string,
        receiptURL: transactionData.receiptURL as string,
        createdAt: transactionData.createdAt as Date
      }
    }
  }

  const result: Order = {
    id: orderRs.orders.id,
    userID: orderRs.orders.userID as string,
    address: addressRs as Address,
    shipMethod: selectedShipMethod,
    status: orderRs.orders.status as string,
    orderItems: orderItemsObj as OrderItems[],
    total: Number(orderRs.orders.total),
    transaction: transaction,
    createdAt: orderRs.orders.createdAt,
    updatedAt: orderRs.orders.updatedAt
  }

  return result
}

export const getOrderByAdmin = async (
  orderID: string
): Promise<Order | string> => {
  const db = getDbClient()
  const orderRs = await db
    .select()
    .from(tblOrders)
    .leftJoin(tblUsers, eq(tblUsers.id, tblOrders.userID))
    .where(eq(tblOrders.id, orderID))
    .limit(1)
    .then((rows) => rows[0])

  if (!orderRs) throw new Error('no order found!!!')

  const shipMethodRs = await db
    .select()
    .from(tblShipMethod)
    .where(eq(tblShipMethod.id, orderRs.orders.shipMethodID as number))
    .limit(1)
    .then((rows) => rows[0])

  const selectedShipMethod: ShipMethod = {
    id: shipMethodRs.id,
    method: shipMethodRs.method as string,
    detail: shipMethodRs.detail as string,
    price: Number(shipMethodRs.price)
  }

  const addressRs = await db
    .select({
      id: tblAddresses.id,
      fullname: tblAddresses.fullname,
      phoneNumber: tblAddresses.phoneNumber,
      district: tblAddresses.district,
      address: tblAddresses.address,
      city: tblAddresses.city,
      country: tblAddresses.country
    })
    .from(tblAddresses)
    .where(eq(tblAddresses.id, orderRs.orders.addressID as number))
    .limit(1)
    .then((rows) => rows[0])

  const orderItemsRs = await db
    .select({
      id: tblOrderItems.id,
      name: tblProducts.name,
      image: tblProducts.image,
      quantity: tblOrderItems.quantity,
      price: tblOrderItems.price
    })
    .from(tblOrderItems)
    .leftJoin(tblProducts, eq(tblProducts.id, tblOrderItems.productID))
    .where(eq(tblOrderItems.orderID, orderRs.orders.id as string))

  const orderItemsObj = orderItemsRs.map((item) => ({
    ...item,
    price: Number(item.price)
  }))

  let transaction: Transaction | undefined = undefined

  if (orderRs.orders.status === 'complete') {
    const transactionData = await db
      .select()
      .from(tblTransactions)
      .where(eq(tblTransactions.orderID, orderRs.orders.id))
      .limit(1)
      .then((rows) => rows[0])
    if (transactionData) {
      transaction = {
        id: transactionData.id,
        orderID: transactionData.orderID as string,
        userID: transactionData.userID as string,
        stripePaymentIntentID: transactionData.stripePaymentIntentID as string,
        stripeStatus: transactionData.stripeStatus as string,
        amount: Number(transactionData.amount),
        currency: transactionData.currency as string,
        receiptURL: transactionData.receiptURL as string,
        createdAt: transactionData.createdAt as Date
      }
    }
  }

  const result: Order = {
    id: orderRs.orders.id,
    userID: orderRs.orders.userID as string,
    address: addressRs as Address,
    shipMethod: selectedShipMethod,
    status: orderRs.orders.status as string,
    orderItems: orderItemsObj as OrderItems[],
    total: Number(orderRs.orders.total),
    transaction: transaction,
    createdAt: orderRs.orders.createdAt,
    updatedAt: orderRs.orders.updatedAt
  }

  return result
}

// export const insertTransaction = async (
//   userID: string,
//   orderID: string,
//   type: string,
//   deposit: number
// ): Promise<Transaction | string> => {
//   const db = getDbClient()

//   const [checkUserAndOrder] = await db
//     .select({
//       userID: tblUsers.id,
//       orderID: tblOrders.id
//     })
//     .from(tblUsers)
//     .innerJoin(tblOrders, eq(tblOrders.userID, tblUsers.id))
//     .where(and(eq(tblUsers.id, userID), eq(tblOrders.id, orderID)))
//     .limit(1)
//   if (!checkUserAndOrder) throw new Error('no user found')

//   return await db.transaction(async (trx) => {
//     const insertRs = await trx
//       .insert(tblTransactions)
//       .values({
//         orderID,
//         userID,
//         type,
//         deposit: deposit.toString(),
//         status: 'paid'
//       })
//       .returning()

//     const transactionRs: Transaction = {
//       id: insertRs[0].id,
//       orderID: insertRs[0].orderID as string,
//       userID: insertRs[0].userID as string,
//       type: insertRs[0].type as string,
//       deposit: Number(insertRs[0].deposit),
//       status: insertRs[0].status as string,
//       createdAt: insertRs[0].createdAt as Date,
//       updatedAt: insertRs[0].updatedAt as Date
//     }

//     return transactionRs
//   })
// }

export const createShipMethod = async (
  method: string,
  detail: string,
  price: number
): Promise<ShipMethod> => {
  const db = getDbClient()
  const [newShipMethod] = await db
    .insert(tblShipMethod)
    .values({
      method,
      detail,
      price: price.toString()
    })
    .returning()

  if (!newShipMethod) {
    throw new Error('Failed to create shipping method')
  }

  const newShipMethodObj: ShipMethod = {
    id: newShipMethod.id,
    detail: newShipMethod.detail as string,
    method: newShipMethod.method as string,
    price: Number(newShipMethod.price)
  }

  return newShipMethodObj
}

export const getAllShipMethods = async (): Promise<ShipMethod[]> => {
  const db = getDbClient()

  const rs = await db
    .select()
    .from(tblShipMethod)
    .then((rows) => rows)
  console.log('get succes')
  const listShipMethod: ShipMethod[] = rs.map((method) => ({
    id: method.id,
    method: method.method as string,
    detail: method.detail as string,
    price: Number(method.price)
  }))
  return listShipMethod
}

export const saveTransaction = async (
  orderID: string,
  userID: string,
  stripePaymentIntentID: string,
  stripeStatus: string,
  amount: number,
  receiptURL: string
): Promise<any> => {
  const db = await getDbClient()
  try {
    const res = await db
      .insert(tblTransactions)
      .values({
        orderID: orderID,
        userID: userID,
        stripePaymentIntentID: stripePaymentIntentID,
        stripeStatus: stripeStatus,
        amount: amount.toString(),
        receiptURL: receiptURL,
        currency: 'USD'
      })
      .returning()
    await db
      .update(tblOrders)
      .set({ status: 'complete' })
      .where(eq(tblOrders.id, orderID))
    console.log('Transaction saved successfully.')
    return res
  } catch (error) {
    console.error('Error saving transaction:', error)
    throw new Error('Failed to save transaction.')
  }
}

export const getTransactionByOrderID = async (
  orderID: string
): Promise<Transaction> => {
  const db = getDbClient()

  try {
    // Fetch transaction details based on orderID
    const transaction = await db
      .select()
      .from(tblTransactions)
      .where(eq(tblTransactions.orderID, orderID))
      .limit(1)
      .then((rows) => rows[0]) // Get the first row if available

    if (!transaction) {
      throw new Error(`Transaction for orderID ${orderID} not found`)
    }

    const res: Transaction = {
      id: transaction.id,
      userID: transaction.userID as string,
      orderID: transaction.orderID as string,
      stripePaymentIntentID: transaction.stripePaymentIntentID as string,
      stripeStatus: transaction.stripeStatus as string,
      amount: Number(transaction.amount),
      currency: transaction.currency as string,
      receiptURL: transaction.receiptURL as string,
      createdAt: transaction.createdAt as Date
    }
    return res
  } catch (error) {
    console.error('Error fetching transaction by orderID:', error)
    throw new Error('Failed to fetch transaction.')
  }
}

export const getAllOrders = async (userID: string): Promise<Order[]> => {
  const db = getDbClient()

  // Fetch all orders for the user
  const orders = await db
    .select()
    .from(tblOrders)
    .where(eq(tblOrders.userID, userID))
    .then((rows) => rows)

  const results: Order[] = []

  for (const order of orders) {
    // Fetch shipping method details
    const shippingMethod = await db
      .select()
      .from(tblShipMethod)
      .where(eq(tblShipMethod.id, order.shipMethodID as number))
      .limit(1)
      .then((rows) => rows[0])

    const selectedShipMethod: ShipMethod = {
      id: shippingMethod.id,
      method: shippingMethod.method as string,
      detail: shippingMethod.detail as string,
      price: Number(shippingMethod.price)
    }

    // Fetch address details
    const address = await db
      .select({
        id: tblAddresses.id,
        fullname: tblAddresses.fullname,
        address: tblAddresses.address,
        district: tblAddresses.district,
        city: tblAddresses.city,
        country: tblAddresses.country,
        phoneNumber: tblAddresses.phoneNumber
      })
      .from(tblAddresses)
      .where(eq(tblAddresses.id, order.addressID as number))
      .limit(1)
      .then((rows) => rows[0])

    if (!address) {
      throw new Error(`Address not found for order ID: ${order.id}`)
    }

    const addressObj: Address = {
      id: address.id,
      fullname: address.fullname as string,
      address: address.address as string,
      district: address.district as string,
      city: address.city as string,
      country: address.country as string,
      phoneNumber: address.phoneNumber as string
    }

    // Fetch order items
    const orderItems = await db
      .select({
        id: tblOrderItems.id,
        name: tblProducts.name,
        image: tblProducts.image,
        quantity: tblOrderItems.quantity,
        price: tblOrderItems.price
      })
      .from(tblOrderItems)
      .leftJoin(tblProducts, eq(tblProducts.id, tblOrderItems.productID))
      .where(eq(tblOrderItems.orderID, order.id as string))
      .then((rows) =>
        rows.map((item) => ({
          ...item,
          price: Number(item.price)
        }))
      )

    let transaction: Transaction | undefined = undefined

    // If the order status is "success", fetch the transaction
    if (order.status === 'success') {
      const transactionData = await db
        .select()
        .from(tblTransactions)
        .where(eq(tblTransactions.orderID, order.id))
        .limit(1)
        .then((rows) => rows[0])

      if (transactionData) {
        transaction = {
          id: transactionData.id,
          orderID: transactionData.orderID as string,
          userID: transactionData.userID as string,
          stripePaymentIntentID:
            transactionData.stripePaymentIntentID as string,
          stripeStatus: transactionData.stripeStatus as string,
          amount: Number(transactionData.amount),
          currency: transactionData.currency as string,
          receiptURL: transactionData.receiptURL as string,
          createdAt: transactionData.createdAt as Date
        }
      }
    }

    // Assemble the order object
    const orderDetail: Order = {
      id: order.id,
      userID: order.userID as string,
      address: addressObj,
      status: order.status as string,
      shipMethod: selectedShipMethod,
      orderItems: orderItems as OrderItems[],
      total: Number(order.total),
      transaction: transaction, // Include transaction if available
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }

    results.push(orderDetail)
  }

  return results
}

export const getTopSellingProducts = async () => {
  const db = getDbClient()
  // Replace `orderItems` with your actual order items table
  const result = await db.execute(
    sql`
      SELECT 
        products.id AS product_id,
        products.name AS product_name,
        SUM(o.quantity) AS total_quantity,
        SUM(o.quantity * pp.price) AS total_revenue
      FROM 
        products
      JOIN 
        orderItems o ON p.id = o.productID
      GROUP BY 
        p.id, p.name
      ORDER BY 
        total_quantity DESC
      LIMIT 3
    `
  )
  return result.rows
}

export const getAllOrdersForAdmin = async (
  page: number,
  pageSize: number
): Promise<{
  data: any[]
  meta: { page: number; page_limit: number; total_pages: number; total: number }
}> => {
  const db = getDbClient()

  // Step 1: Get the total count of orders to calculate total pages
  const totalOrders = await db
    .select()
    .from(tblOrders)
    .then((rows) => rows.length) // Get total number of orders

  const totalPages = Math.ceil(totalOrders / pageSize) // Calculate total pages

  // Step 2: Fetch the orders for the current page
  const orders = await db
    .select()
    .from(tblOrders)
    .limit(pageSize) // Limit the number of orders per page
    .offset((page - 1) * pageSize) // Offset to get the correct page
    .then((rows) => rows)

  const results = []

  // Step 3: Fetch related data for each order
  for (const order of orders) {
    // Fetch shipping method details
    const shippingMethod = await db
      .select()
      .from(tblShipMethod)
      .where(eq(tblShipMethod.id, order.shipMethodID as number))
      .limit(1)
      .then((rows) => rows[0])

    const selectedShipMethod: ShipMethod = {
      id: shippingMethod.id,
      method: shippingMethod.method as string,
      detail: shippingMethod.detail as string,
      price: Number(shippingMethod.price)
    }

    // Fetch address details
    const address = await db
      .select({
        id: tblAddresses.id,
        fullname: tblAddresses.fullname,
        address: tblAddresses.address,
        district: tblAddresses.district,
        city: tblAddresses.city,
        country: tblAddresses.country,
        phoneNumber: tblAddresses.phoneNumber
      })
      .from(tblAddresses)
      .where(eq(tblAddresses.id, order.addressID as number))
      .limit(1)
      .then((rows) => rows[0])

    if (!address) {
      throw new Error(`Address not found for order ID: ${order.id}`)
    }

    const addressObj: Address = {
      id: address.id,
      fullname: address.fullname as string,
      address: address.address as string,
      district: address.district as string,
      city: address.city as string,
      country: address.country as string,
      phoneNumber: address.phoneNumber as string
    }

    // Fetch order items
    const orderItems = await db
      .select({
        id: tblOrderItems.id,
        productID: tblOrderItems.productID,
        name: tblProducts.name,
        image: tblProducts.image,
        quantity: tblOrderItems.quantity,
        price: tblOrderItems.price
      })
      .from(tblOrderItems)
      .leftJoin(tblProducts, eq(tblProducts.id, tblOrderItems.productID))
      .where(eq(tblOrderItems.orderID, order.id as string))
      .then((rows) =>
        rows.map((item) => ({
          ...item,
          price: Number(item.price)
        }))
      )

    let transaction: Transaction | undefined = undefined

    // If the order status is "success", fetch the transaction
    if (order.status === 'complete') {
      const transactionData = await db
        .select()
        .from(tblTransactions)
        .where(eq(tblTransactions.orderID, order.id))
        .limit(1)
        .then((rows) => rows[0])

      if (transactionData) {
        transaction = {
          id: transactionData.id,
          orderID: transactionData.orderID as string,
          userID: transactionData.userID as string,
          stripePaymentIntentID:
            transactionData.stripePaymentIntentID as string,
          stripeStatus: transactionData.stripeStatus as string,
          amount: Number(transactionData.amount),
          currency: transactionData.currency as string,
          receiptURL: transactionData.receiptURL as string,
          createdAt: transactionData.createdAt as Date
        }
      }
    }

    const user = await findUserByID(order.userID as string)

    // Assemble the order object
    const orderDetail = {
      id: order.id,
      user: user,
      address: addressObj,
      status: order.status as string,
      shipMethod: selectedShipMethod,
      orderItems: orderItems as OrderItems[],
      total: Number(order.total),
      transaction: transaction, // Include transaction if available
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }

    results.push(orderDetail)
  }

  // Step 4: Return the data with pagination metadata
  return {
    data: results,
    meta: {
      page: page,
      page_limit: pageSize,
      total_pages: totalPages,
      total: totalOrders
    }
  }
}

export const calculateRevenueEachMonth = async () => {
  const db = await getDbClient()

  const orderRs = await db
    .select({
      createdAt: tblOrders.createdAt,
      total: tblOrders.total
    })
    .from(tblOrders)

  // Step 1: Calculate monthly revenue
  const monthlyRevenue = orderRs.reduce(
    (acc, order) => {
      const date = new Date(order.createdAt)
      const monthYearKey = `${date.getFullYear()}-${date.getMonth() + 1}` // "YYYY-MM"

      if (!acc[monthYearKey]) {
        acc[monthYearKey] = 0
      }

      acc[monthYearKey] += parseFloat(order.total as string)

      return acc
    },
    {} as Record<string, number>
  )

  // Step 2: Initialize an array with all months
  const allMonths = [
    { month: 'January', key: '01' },
    { month: 'February', key: '02' },
    { month: 'March', key: '03' },
    { month: 'April', key: '04' },
    { month: 'May', key: '05' },
    { month: 'June', key: '06' },
    { month: 'July', key: '07' },
    { month: 'August', key: '08' },
    { month: 'September', key: '09' },
    { month: 'October', key: '10' },
    { month: 'November', key: '11' },
    { month: 'December', key: '12' }
  ]

  // Step 3: Merge the calculated revenue with all months
  const result = allMonths.map(({ month, key }) => {
    const monthYearKey = `${new Date().getFullYear()}-${key}` // For current year, use 'YYYY-MM'
    const totalRevenue = monthlyRevenue[monthYearKey] || 0 // Default to 0 if no revenue for this month

    return {
      month, // Full month name (e.g., "January")
      totalRevenue: Number(totalRevenue.toFixed(2)) // Ensure two decimal places
    }
  })

  return result
}
