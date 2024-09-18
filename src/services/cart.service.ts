import { getDbClient } from '@/database/connection'
import { tblCart, tblCartItems } from '@/models/cart.schema'
import { tblProductPriceTag, tblProducts } from '@/models/product.schema'
import { tblUser } from '@/models/user.schema'
import { Cart, CartItems } from '@/types/cart'
import { and, eq } from 'drizzle-orm'

export const addToCart = async (
  productID: number,
  userID: string
): Promise<string> => {
  const db = getDbClient()
  const checkUser = await db
    .select()
    .from(tblUser)
    .where(eq(tblUser.id, userID))
    .limit(1)
  if (checkUser.length === 0)
    throw new Error('no user found with this id, pls try again')

  let checkCart = await db
    .select()
    .from(tblCart)
    .where(eq(tblCart.userID, userID))
    .limit(1)
  if (checkCart.length === 0) {
    const newCart = await db
      .insert(tblCart)
      .values({ userID: userID })
      .returning()
    checkCart = newCart
  }
  const cartID = checkCart[0].id

  let productPrice

  const checkPrice = await db
    .select({
      price: tblProductPriceTag.price,
      discount: tblProductPriceTag.discount,
      salePrice: tblProductPriceTag.salePrice
    })
    .from(tblProductPriceTag)
    .where(eq(tblProductPriceTag.productID, productID))
    .limit(1)
  if (checkPrice.length == 0)
    throw new Error('price from this product cannot found')
  else if (checkPrice[0].discount === true) {
    productPrice = checkPrice[0].salePrice
  } else {
    productPrice = checkPrice[0].price
  }

  const checkItem = await db
    .select({
      id: tblCartItems.id,
      name: tblProducts.name,
      image: tblProducts.image,
      quantity: tblCartItems.quantity,
      price: tblCartItems.price
    })
    .from(tblCartItems)
    .innerJoin(tblProducts, eq(tblProducts.id, tblCartItems.productID))
    .where(
      and(
        eq(tblCartItems.productID, productID),
        eq(tblCartItems.cartID, cartID)
      )
    )
    .limit(1)
  if (checkItem.length === 0) {
    await db
      .insert(tblCartItems)
      .values({ productID, cartID, price: productPrice })
      .returning()
  } else {
    const itemQuantity = (checkItem[0].quantity as number) + 1
    await db.update(tblCartItems).set({ quantity: itemQuantity }).returning()
  }

  return 'add to cart success'
}

export const getCartUser = async (userID: string): Promise<Cart | string> => {
  const db = getDbClient()
  const checkUser = await db
    .select({ id: tblUser.id })
    .from(tblUser)
    .where(eq(tblUser.id, userID))
  if (checkUser.length === 0) throw new Error('something wrong happens')

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

  const cartItemsRs = await db
    .select({
      id: tblCartItems.id,
      name: tblProducts.name,
      image: tblProducts.image,
      quantity: tblCartItems.quantity,
      price: tblCartItems.price
    })
    .from(tblCartItems)
    .innerJoin(tblProducts, eq(tblProducts.id, tblCartItems.productID))
    .where(eq(tblCartItems.cartID, cartRs[0].id))

  const result: Cart = {
    id: cartRs[0].id,
    userID: cartRs[0].userID as string,
    status: cartRs[0].status as string,
    cartItems: cartItemsRs as CartItems[]
  }

  return result
}
