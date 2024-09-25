export type Cart = {
  id: string
  userID: string
  status: string
  cartItems: CartItems[]
}

export type CartItems = {
  id: number
  name: string
  image: string
  quantity: number
  price: number
}
