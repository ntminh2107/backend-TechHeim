import { HttpError } from '@/libs/HttpError'
import {
  filteredbycategory,
  filteredbyBrand,
  insertProduct,
  productDetail,
  filteredFieldOptions,
  insertCommentOnProduct,
  selectProductComments,
  getAllProduct,
  searchProductsByName,
  getSaleProducts,
  getBrands,
  getCategories,
  addImagePreviews
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
    percent
  )

  res.status(HttpStatusCode.CREATED).json(data)
}

const getProductDetail = async (req: Request, res: Response) => {
  const productID = req.params.id
  if (!productID)
    throw new HttpError(
      'Page you looking for is not found',
      HttpStatusCode.NOT_FOUND
    )

  const data = await productDetail(Number(productID))
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const listFilteredByBrand = async (req: Request, res: Response) => {
  const brand = req.params.brand
  if (!brand)
    throw new HttpError(
      'Page you looking for is not found',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredbyBrand(brand)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const listFilteredByCategory = async (req: Request, res: Response) => {
  const category = req.params.category
  if (!category)
    throw new HttpError(
      'something wents wrong!!! pls try again',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredbyBrand(category)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const filteredProduct = async (req: Request, res: Response) => {
  const category = req.params.category

  const queryParams = req.query as { [key: string]: string }

  if (!category)
    throw new HttpError(
      'Page you looking for is not found',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredbycategory(category, queryParams)

  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const specFilter = async (req: Request, res: Response) => {
  const category = req.params.category

  if (!category)
    throw new HttpError(
      'Page you looking for is not found',
      HttpStatusCode.NOT_FOUND
    )

  const data = await filteredFieldOptions(category)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const addCommentToProduct = async (req: Request, res: Response) => {
  const userID = req.user?.id
  const { productID, content, rating } = req.body
  if (!productID || !userID)
    throw new HttpError('Product ID not found', HttpStatusCode.NOT_FOUND)
  const data = await insertCommentOnProduct(userID, productID, content, rating)

  res.status(HttpStatusCode.CREATED).json(data)
}

const getProductComments = async (req: Request, res: Response) => {
  const { productID } = req.params
  if (!productID)
    throw new HttpError(
      'Page you looking for is not found',
      HttpStatusCode.NOT_FOUND
    )
  const data = await selectProductComments(Number(productID))
  res.status(HttpStatusCode.CREATED).json(data)
}

const getProducts = async (req: Request, res: Response) => {
  const limit = req.query.limit
    ? parseInt(req.query.limit as string, 10)
    : undefined
  const offset = req.query.offset
    ? parseInt(req.query.offset as string, 10)
    : undefined
  const data = await getAllProduct(limit, offset)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const getSearchProducts = async (req: Request, res: Response) => {
  const search = req.query.search as string
  const data = await searchProductsByName(search)

  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const getSaleProductsList = async (req: Request, res: Response) => {
  const limit = req.query.limit
    ? parseInt(req.query.limit as string, 10)
    : undefined
  const data = await getSaleProducts(Number(limit))

  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const getBrandsList = async (_req: Request, res: Response) => {
  const data = await getBrands()

  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const getCategoriesList = async (_req: Request, res: Response) => {
  const data = await getCategories()
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

const addImagePreview = async (req: Request, res: Response) => {
  const { productID } = req.body
  const imagePreview = req.body.imagePreview as string[]
  const data = await addImagePreviews(productID, imagePreview)
  res.status(HttpStatusCode.ACCEPTED).json(data)
}

export {
  addProduct,
  getProductDetail,
  listFilteredByBrand,
  listFilteredByCategory,
  filteredProduct,
  specFilter,
  addCommentToProduct,
  getProductComments,
  getProducts,
  getSearchProducts,
  getSaleProductsList,
  getBrandsList,
  getCategoriesList,
  addImagePreview
}
