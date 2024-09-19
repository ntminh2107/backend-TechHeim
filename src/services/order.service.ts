import { getDbClient } from '@/database/connection'
import {
  tblCart,
  tblCartItems,
  tblOrder,
  tblOrderItems
} from '@/models/cart.schema'
import { tblUser } from '@/models/user.schema'
import { Order } from '@/types/cart'
import { eq } from 'drizzle-orm'

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
// export const getOrder = async (userID: string): Promise<Order> => {
//   const db = getDbClient()
//   return await db.transaction(async (trx) => {

//     const

//     return
//   })
// }
