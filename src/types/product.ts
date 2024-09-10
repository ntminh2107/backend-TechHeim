export type Product = {
  id: string
  name: string
  image: string
  price: number
  discount?: boolean
  percent?: number
  salePrice?: number
  color: string
  rating?: number
  category: string
  brand: string
  specifications?: Specification[]
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
}
