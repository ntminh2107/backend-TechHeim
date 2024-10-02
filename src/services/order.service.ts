import { getDbClient } from '@/database/connection'
import { tblCarts, tblCartItems } from '@/models/cart.schema'
import {
  tblOrderItems,
  tblOrders,
  tblTransactions
} from '@/models/order.schema'
import { tblProducts } from '@/models/product.schema'
import { tblAddresses, tblUsers } from '@/models/user.schema'
import { Order, OrderItems, Transaction } from '@/types/order'
import { Address } from '@/types/user'
import { and, eq } from 'drizzle-orm'

export const insertOrder = async (
  userID: string,
  addressID: number
): Promise<string> => {
  const db = getDbClient()

  const checkCart = await db
    .select()
    .from(tblCarts)
    .where(eq(tblCarts.userID, userID))
    .limit(1)
    .then((rows) => rows[0])
  if (!checkCart) throw new Error('something wrong happen')

  return await db.transaction(async (trx) => {
    const insertOrder = await trx
      .insert(tblOrders)
      .values({ userID: userID, addressID })
      .returning()

    if (!insertOrder) throw new Error('something wrong happen')

    const orderID = insertOrder[0].id

    const cartItemRs = await trx
      .select()
      .from(tblCartItems)
      .where(eq(tblCartItems.cartID, checkCart.id))

    if (cartItemRs.length === 0 || !cartItemRs)
      throw new Error(
        'dont have any items in your cart!!! pls choose an item before going to order'
      )
    let totalOrder = 0

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

    await trx.insert(tblOrderItems).values(orderItems).returning()

    await trx
      .update(tblOrders)
      .set({ total: totalOrder.toString() })
      .where(eq(tblOrders.id, orderID))

    return 'create new order success'
  })
}

/*TODO: GET order + do transaction w/ noti */
export const getOrder = async (
  userID: string,
  orderID: string
): Promise<Order | string> => {
  const db = getDbClient()
  const orderRs = await db
    .select()
    .from(tblOrders)
    .leftJoin(tblUsers, eq(tblUsers.id, tblOrders.userID))
    .where(and(eq(tblUsers.id, userID), eq(tblOrders.id, orderID)))
    .limit(1)
    .then((rows) => rows[0])

  if (!orderRs) throw new Error('no order found!!!')
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
    .where(eq(tblCartItems.cartID, orderRs.orders.id as string))

  const orderItemsObj = orderItemsRs.map((item) => ({
    ...item,
    price: Number(item.price)
  }))

  const result: Order = {
    id: orderRs.orders.id,
    userID: orderRs.orders.userID as string,
    address: addressRs as Address,
    status: orderRs.orders.status as string,
    orderItems: orderItemsObj as OrderItems[],
    total: Number(orderRs.orders.total),
    createdAt: orderRs.orders.createdAt,
    updatedAt: orderRs.orders.updatedAt
  }

  return result
}

export const insertTransaction = async (
  userID: string,
  orderID: string,
  type: string,
  deposit: number
): Promise<Transaction | string> => {
  const db = getDbClient()

  const [checkUserAndOrder] = await db
    .select({
      userID: tblUsers.id,
      orderID: tblOrders.id
    })
    .from(tblUsers)
    .innerJoin(tblOrders, eq(tblOrders.userID, tblUsers.id))
    .where(and(eq(tblUsers.id, userID), eq(tblOrders.id, orderID)))
    .limit(1)
  if (!checkUserAndOrder) throw new Error('no user found')

  return await db.transaction(async (trx) => {
    const insertRs = await trx
      .insert(tblTransactions)
      .values({
        orderID,
        userID,
        type,
        deposit: deposit.toString(),
        status: 'complete'
      })
      .returning()

    const transactionRs: Transaction = {
      id: insertRs[0].id,
      orderID: insertRs[0].orderID as string,
      userID: insertRs[0].userID as string,
      type: insertRs[0].type as string,
      deposit: Number(insertRs[0].deposit),
      status: insertRs[0].status as string,
      createdAt: insertRs[0].createdAt as Date,
      updatedAt: insertRs[0].updatedAt as Date
    }

    return transactionRs
  })
}
