import { getDbClient } from '@/database/connection'
import { tblCarts, tblCartItems } from '@/models/cart.schema'
import { tblOrderItems, tblOrders, tblShipMethod } from '@/models/order.schema'
import { tblProducts } from '@/models/product.schema'
import { tblAddresses, tblUsers } from '@/models/user.schema'
import { Order, OrderItems, ShipMethod } from '@/types/order'
import { Address } from '@/types/user'
import { and, eq } from 'drizzle-orm'

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
      const total: number = Number(item.price) * (item.quantity as number)
      totalOrder += total

      return {
        orderID,
        productID: item.productID as number,
        quantity: item.quantity as number,
        price: total.toString()
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

  const result: Order = {
    id: orderRs.orders.id,
    userID: orderRs.orders.userID as string,
    address: addressRs as Address,
    shipMethod: selectedShipMethod,
    status: orderRs.orders.status as string,
    orderItems: orderItemsObj as OrderItems[],
    total: Number(orderRs.orders.total),
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
