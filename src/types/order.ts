import { Address } from './user'

export type OrderItems = {
  name: string
  image: string
  quantity: number
  price: number
}

export type Order = {
  id: string
  userID: string
  address: Address
  status: string
  orderItems: OrderItems[]
  total: number
  transaction?: Transaction[]
  createdAt: Date
  updatedAt: Date
}

export type ShipMethod = {
  id: number
  method: string
  detail: string
  price: number
}

export type Transaction = {
  id: string
  orderID: string
  type: string
  deposit: number
  status: string
  createdAt: Date
  updatedAt: Date
}
