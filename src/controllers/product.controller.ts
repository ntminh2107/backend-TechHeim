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
      HttpStatusCode.NOT_FOUND
    )
  }

  const data = await insertProduct(
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
    data: data
  })
}

const getProductDetail = async (req: Request, res: Response) => {
  const productID = req.params.id
  if (!productID)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.NOT_FOUND
    )

  const data = await productDetail(Number(productID))
  res.status(HttpStatusCode.ACCEPTED).json({
    message: `product with ID: ${productID} found`,
    data: data
  })
}

const listFilteredByBrand = async (req: Request, res: Response) => {
  const brand = req.params.brand
  if (!brand)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredbyBrand(brand)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: `list of product from brand : ${brand}`,
    data: data
  })
}

const listFilteredByCategory = async (req: Request, res: Response) => {
  const category = req.params.category
  if (!category)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredbyBrand(category)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: `list of product from category : ${category}`,
    data: data
  })
}

const filteredProduct = async (req: Request, res: Response) => {
  const category = req.params.category

  const queryParams = req.query as { [key: string]: string }

  if (!category || !queryParams)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredbycategory(category, queryParams)

  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'product filter list :',
    data: data
  })
}

const specFilterCtrl = async (req: Request, res: Response) => {
  const category = req.params.category

  if (!category)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredFieldOptions(category)
  res.status(HttpStatusCode.ACCEPTED).json({
    message: 'Options for filtering by spec:',
    data: data
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
