import { HttpError } from '@/libs/HttpError'
import { insertProduct } from '@/services/product.service'
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

  res.status(HttpStatusCode.ACCEPTED).json({
    product: product
  })
}

export default addProduct
