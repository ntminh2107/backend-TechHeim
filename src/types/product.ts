export type Product = {
  id: number
  name: string
  image: string
  price?: PriceTag
  color: string
  rating?: number
  category: string
  brand: string
  specifications?: { key: string; value: string }[]
  comments?: Comment[]
  imagePreview?: string[]
}

export type Category = {
  id: number
  image: string
  categoryName: string
}

export type Brand = {
  id: number
  brandName: string
  image: string
}

export type Specification = {
  id: number
  productID: string
  key: string
  value: string
}

export type PriceTag = {
  id: number
  productID: number
  price: number
  discount?: boolean
  percent?: number
  saleprice?: number
}

export type Comments = {
  id: number
  productID: number
  userID: string
  content: string
  date: Date
  rating: number
}
