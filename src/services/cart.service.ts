import { getDbClient } from '@/database/connection'
import { tblCart, tblCartItems } from '@/models/cart.schema'
import { tblProductPriceTag, tblProducts } from '@/models/product.schema'
import { tblUser } from '@/models/user.schema'
import { Cart, CartItems } from '@/types/cart'
import { and, eq } from 'drizzle-orm'

/*TODO: revert all services into a transaction */
export const addToCart = async (
  productID: number,
  userID: string
): Promise<string> => {
  const db = getDbClient()

  return await db.transaction(async (trx) => {
    const [userAndCart] = await trx
      .select({
        user: tblUser,
        cart: tblCart
      })
      .from(tblUser)
      .leftJoin(tblCart, eq(tblCart.userID, tblUser.id))
      .where(eq(tblUser.id, userID))
      .limit(1)

    if (!userAndCart) {
      throw new Error('User not found')
    }

    let cartID: string
    if (!userAndCart.cart) {
      const [newCart] = await trx
        .insert(tblCart)
        .values({ userID })
        .returning({ id: tblCart.id })
      cartID = newCart.id
    } else {
      cartID = userAndCart.cart.id
    }

    const [priceAndItem] = await trx
      .select({
        price: tblProductPriceTag.price,
        discount: tblProductPriceTag.discount,
        salePrice: tblProductPriceTag.salePrice,
        cartItem: tblCartItems
      })
      .from(tblProductPriceTag)
      .leftJoin(
        tblCartItems,
        and(
          eq(tblCartItems.productID, tblProductPriceTag.productID),
          eq(tblCartItems.cartID, cartID)
        )
      )
      .where(eq(tblProductPriceTag.productID, productID))
      .limit(1)

    if (!priceAndItem) {
      throw new Error('Product price not found')
    }

    const productPrice = priceAndItem.discount
      ? priceAndItem.salePrice
      : priceAndItem.price

    if (!priceAndItem.cartItem) {
      await trx
        .insert(tblCartItems)
        .values({ productID, cartID, price: productPrice })
    } else {
      await trx
        .update(tblCartItems)
        .set({ quantity: (priceAndItem.cartItem.quantity as number) + 1 })
        .where(eq(tblCartItems.id, priceAndItem.cartItem.id))
    }

    return 'Item added to cart successfully'
  })
}

export const getCartUser = async (userID: string): Promise<Cart | string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const [checkUser] = await trx
      .select({ id: tblUser.id })
      .from(tblUser)
      .where(eq(tblUser.id, userID))
    if (!checkUser) throw new Error('something wrong happens')

    const cartRs = await trx
      .select({
        id: tblCart.id,
        userID: tblUser.id,
        status: tblCart.status
      })
      .from(tblCart)
      .innerJoin(tblUser, eq(tblUser.id, tblCart.userID))
      .where(eq(tblUser.id, userID))
      .limit(1)
      .then((rows) => rows[0])

    const cartItemsRs = await trx
      .select({
        id: tblCartItems.id,
        name: tblProducts.name,
        image: tblProducts.image,
        quantity: tblCartItems.quantity,
        price: tblCartItems.price
      })
      .from(tblCartItems)
      .innerJoin(tblProducts, eq(tblProducts.id, tblCartItems.productID))
      .where(eq(tblCartItems.cartID, cartRs.id))

    const result: Cart = {
      id: cartRs.id,
      userID: cartRs.userID as string,
      status: cartRs.status as string,
      cartItems: cartItemsRs as CartItems[]
    }

    return result
  })
}
