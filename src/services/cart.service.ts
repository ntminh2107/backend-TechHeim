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
  const checkCart = await db
    .select()
    .from(tblCart)
    .where(eq(tblCart.userID, userID))
    .limit(1)
    .then((rows) => rows[0])

  if (!checkCart) {
    throw new Error('User not found')
  }
  return await db.transaction(async (trx) => {
    let cartID: string
    if (!checkCart) {
      const [newCart] = await trx
        .insert(tblCart)
        .values({ userID })
        .returning({ id: tblCart.id })
      cartID = newCart.id
    } else {
      cartID = checkCart.id
    }

    const [priceAndItem] = await trx
      .select({
        price: tblProductPriceTag.price,
        percent: tblProductPriceTag.percent,
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

    const salePrice = (
      Number(priceAndItem.price) *
      (1 - (priceAndItem.percent as number) / 100)
    )
      .toFixed(2)
      .toString()

    const productPrice = priceAndItem.percent ? salePrice : priceAndItem.price

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
  let cart
  const cartRs = await db
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
  if (!cartRs) {
    const newCart = await db
      .insert(tblCart)
      .values({ userID })
      .returning()
      .then((rows) => rows[0])
    cart = newCart
  } else {
    cart = cartRs
  }
  const cartItemsRs = await db
    .select({
      id: tblCartItems.id,
      name: tblProducts.name,
      image: tblProducts.image,
      quantity: tblCartItems.quantity,
      price: tblCartItems.price
    })
    .from(tblCartItems)
    .leftJoin(tblProducts, eq(tblProducts.id, tblCartItems.productID))
    .where(eq(tblCartItems.cartID, cart.id))

  const itemsWithPriceAsNumber = cartItemsRs.map((item) => ({
    ...item,
    price: Number(item.price)
  }))

  const result: Cart = {
    id: cart.id,
    userID: cart.userID as string,
    status: cart.status as string,
    cartItems: itemsWithPriceAsNumber as CartItems[]
  }

  return result
}

export const updateQuantity = async (
  userID: string,
  productID: number,
  quantity: number
): Promise<Cart | string> => {
  const db = getDbClient()
  const checkCart = await db
    .select({
      cartID: tblCart.id,
      id: tblCartItems.id,
      quantity: tblCartItems.quantity
    })
    .from(tblCart)
    .leftJoin(tblCartItems, eq(tblCartItems.cartID, tblCart.id))
    .where(
      and(eq(tblCart.userID, userID), eq(tblCartItems.productID, productID))
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!checkCart) {
    throw new Error('cart not found')
  }
  return await db.transaction(async (trx) => {
    if (quantity <= 0) {
      await trx
        .delete(tblCartItems)
        .where(eq(tblCartItems.id, checkCart.id as number))
    } else {
      await trx
        .update(tblCartItems)
        .set({ quantity: quantity })
        .where(eq(tblCartItems.id, checkCart.id as number))
    }
    const resultUpdated = await trx
      .select({
        id: tblCart.id,
        userID: tblCart.userID,
        status: tblCart.status
      })
      .from(tblCart)
      .innerJoin(tblUser, eq(tblUser.id, tblCart.userID))
      .where(eq(tblUser.id, userID))
      .limit(1)
      .then((rows) => rows[0])

    const listItemsUpdated = await trx
      .select({
        id: tblCartItems.id,
        name: tblProducts.name,
        image: tblProducts.image,
        quantity: tblCartItems.quantity,
        price: tblCartItems.price
      })
      .from(tblCartItems)
      .innerJoin(tblProducts, eq(tblProducts.id, tblCartItems.productID))
      .where(eq(tblCartItems.cartID, resultUpdated.id))

    const itemsWithPriceAsNumber = listItemsUpdated.map((item) => ({
      ...item,
      price: Number(item.price)
    }))

    const result: Cart = {
      id: resultUpdated.id,
      userID: resultUpdated.userID as string,
      status: resultUpdated.status as string,
      cartItems: itemsWithPriceAsNumber as CartItems[]
    }
    return result
  })
}

export const deleteItem = async (
  userID: string,
  productID: number
): Promise<string> => {
  const db = getDbClient()

  const checkCart = await db
    .select({
      cartID: tblCart.id,
      id: tblCartItems.id,
      quantity: tblCartItems.quantity
    })
    .from(tblCart)

    .leftJoin(tblCartItems, eq(tblCartItems.cartID, tblCart.id))
    .where(
      and(eq(tblCart.userID, userID), eq(tblCartItems.productID, productID))
    )
    .limit(1)
    .then((rows) => rows[0])

  if (!checkCart) {
    throw new Error('cart item not found')
  }
  return await db.transaction(async (trx) => {
    await trx
      .delete(tblCartItems)
      .where(
        and(
          eq(tblCartItems.productID, productID),
          eq(tblCartItems.cartID, checkCart.cartID as string)
        )
      )
    return 'delete item cart success'
  })
}

export const deleteAll = async (userID: string): Promise<string> => {
  const db = getDbClient()
  const checkCart = await db
    .select({ cartID: tblCart.id })
    .from(tblCart)
    .innerJoin(tblUser, eq(tblUser.id, tblCart.userID))
    .where(eq(tblCart.userID, userID))
    .limit(1)
    .then((rows) => rows[0])

  if (!checkCart) return 'cart not found'
  return await db.transaction(async (trx) => {
    //delete all items in cart
    await trx
      .delete(tblCartItems)
      .where(eq(tblCartItems.cartID, checkCart.cartID))
    //delete cart for user
    await trx.delete(tblCart).where(eq(tblCart.id, checkCart.cartID))

    return 'delete all items in cart success'
  })
}
