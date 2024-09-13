import { HttpError } from '@/libs/HttpError'
import { insertProduct, productDetail } from '@/services/product.service'
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
  if (!productID) throw new HttpError('product is not valid')

  const product = await productDetail(Number(productID))
  res.status(HttpStatusCode.ACCEPTED).json({
    message: `product with ID: ${productID} found`,
    product: product
  })
}

export { addProduct, getProductDetail }
