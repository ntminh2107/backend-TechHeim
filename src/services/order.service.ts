import { getDbClient } from '@/database/connection'
import {
  tblCart,
  tblCartItems,
  tblOrder,
  tblOrderItems
} from '@/models/cart.schema'
import { tblProducts } from '@/models/product.schema'
import { tblAddress, tblUser } from '@/models/user.schema'
import { Order, OrderItems } from '@/types/cart'
import { Address } from '@/types/user'
import { and, eq } from 'drizzle-orm'

export const insertOrder = async (
  userID: string,
  addressID: number
): Promise<string> => {
  const db = getDbClient()

  return await db.transaction(async (trx) => {
    const checkUserAndCartID = await trx
      .select({ tblUser, cartID: tblCart.id })
      .from(tblUser)
      .innerJoin(tblCart, eq(tblCart.userID, tblUser.id))
      .where(eq(tblUser.id, userID))
      .limit(1)
      .then((rows) => rows[0])
    if (!checkUserAndCartID) throw new Error('something wrong happen')

    const insertOrder = await trx
      .insert(tblOrder)
      .values({ userID: userID, addressID })
      .returning()

    if (!insertOrder) throw new Error('something wrong happen')

    const orderID = insertOrder[0].id

    const cartItemRs = await trx
      .select()
      .from(tblCartItems)
      .where(eq(tblCartItems.cartID, checkUserAndCartID.cartID))

    if (cartItemRs.length === 0 || !cartItemRs)
      throw new Error(
        'dont have any items in your cart!!! pls choose an item before going to order'
      )
    let totalOrder = 0
    Promise.all(
      cartItemRs.map(async (item) => {
        const total: number = Number(item.price) * (item.quantity as number)
        await trx
          .insert(tblOrderItems)
          .values({
            orderID,
            productID: item.productID as number,
            quantity: item.quantity as number,
            price: total.toString()
          })
          .returning()
        totalOrder += total
      })
    )

    await trx
      .update(tblOrder)
      .set({ total: totalOrder.toString() })
      .where(eq(tblOrder.id, orderID))

    return 'create new order success'
  })
}

/*TODO: GET order + do transaction w/ noti */
export const getOrder = async (
  userID: string,
  orderID: string
): Promise<Order | string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const orderRs = await trx
      .select()
      .from(tblOrder)
      .leftJoin(tblUser, eq(tblUser.id, tblOrder.userID))
      .where(and(eq(tblUser.id, userID), eq(tblOrder.id, orderID)))
      .limit(1)
      .then((rows) => rows[0])

    if (!orderRs) throw new Error('no order found!!!')
    const addressRs = await trx
      .select({
        id: tblAddress.id,
        fullname: tblAddress.fullname,
        address: tblAddress.address,
        city: tblAddress.city,
        country: tblAddress.country
      })
      .from(tblAddress)
      .where(eq(tblAddress.id, orderRs.order.addressID as number))
      .limit(1)
      .then((rows) => rows[0])

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
      .where(eq(tblCartItems.cartID, orderRs.order.id as string))

    const orderItemsObj = orderItemsRs.map((item) => ({
      ...item,
      price: Number(item.price)
    }))

    const result: Order = {
      id: orderRs.order.id,
      userID: orderRs.order.userID as string,
      address: addressRs as Address,
      status: orderRs.order.status as string,
      orderItems: orderItemsObj as OrderItems[],
      total: Number(orderRs.order.total),
      createdAt: orderRs.order.created_at,
      updatedAt: orderRs.order.updated_at
    }

    return result
  })
}

export const insertTransaction = async (
  userID: string,
  type: string
): Promise<void> => {}
