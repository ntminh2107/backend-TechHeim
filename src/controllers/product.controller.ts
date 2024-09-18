import { HttpError } from '@/libs/HttpError'
import {
  filteredbycategory,
  filteredbyBrand,
  insertProduct,
  productDetail,
  filteredFieldOptions
} from '@/services/product.service'
import HttpStatusCode from '@/utils/httpStatusCode'
import { Request, Response } from 'express'

const addProduct = async (req: Request, res: Response) => {
  const {
    name,
    image,
    price,
    color,
    category,
    brand,
    specifications,
    discount,
    percent
  } = req.body

  if (!name || !price || !category || !brand) {
    throw new HttpError(
      'This field must not be empty',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )
  }

  const product = await insertProduct(
    name,
    image,
    price,
    color,
    category,
    brand,
    specifications,
    discount,
    percent
  )

  res.status(HttpStatusCode.CREATED).json({
    message: 'Product information add success!!!',
    product: product
  })
}

const getProductDetail = async (req: Request, res: Response) => {
  const productID = req.params.id
  if (!productID)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )

  const product = await productDetail(Number(productID))
  res.status(HttpStatusCode.ACCEPTED).json({
    message: `product with ID: ${productID} found`,
    product: product
  })
}

const listFilteredByBrand = async (req: Request, res: Response) => {
  const brand = req.params.brand
  if (!brand)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )

  const product = await filteredbyBrand(brand)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: `list of product from brand : ${brand}`,
    product: product
  })
}

const listFilteredByCategory = async (req: Request, res: Response) => {
  const category = req.params.category
  if (!category)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )

  const product = await filteredbyBrand(category)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: `list of product from category : ${category}`,
    product: product
  })
}

const filteredProduct = async (req: Request, res: Response) => {
  const category = req.params.category

  const queryParams = req.query as { [key: string]: string }

  if (!category || !queryParams)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )

  const productList = await filteredbycategory(category, queryParams)

  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'product filter list :',
    products: productList
  })
}

const specFilterCtrl = async (req: Request, res: Response) => {
  const category = req.params.category

  if (!category)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    )

  const filterOptions = await filteredFieldOptions(category)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'Options for filtering by spec:',
    filterOptions: filterOptions
  })
}

export {
  addProduct,
  getProductDetail,
  listFilteredByBrand,
  listFilteredByCategory,
  filteredProduct,
  specFilterCtrl
}
