import { Address } from './user'

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
  price: string
}

export type OrderItems = {
  name: string
  image: string
  quantity: number
  price: string
}

export type Order = {
  id: string
  userID: string
  address: Address
  status: string
  orderItems: OrderItems[]
  total: number
  createdAt: Date
  updatedAt: Date
}
