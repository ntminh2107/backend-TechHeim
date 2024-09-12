export type Product = {
  id: string
  name: string
  image: string
  price: PriceTag
  color: string
  rating?: number
  category: string
  brand: string
  specifications?: { key: string; value: string }[]
  comments?: Comment[]
}

export type Category = {
  id: number
  categoryID: string
  categoryName: string
  totalProducts: number
}

export type Brand = {
  id: number
  brandID: string
  brandName: string
  totalProducts: number
}

export type Comment = {
  id: number
  productID: string
  userID: string
  content: string
  date: Date
  rating: number
}

export type Specification = {
  id: number
  productID: string
  key: string
  value: string
}

export type PriceTag = {
  id: number
  productID: string
  price: string
  discount?: boolean
  percent?: number
  saleprice?: string
}
