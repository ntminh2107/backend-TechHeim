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
  addImagePreviews,
  addCategory,
  editCategory,
  deleteCategory,
  addBrand,
  editBrand,
  deleteBrand,
  editProduct
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
    percent,
    imagePreview
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
    percent,
    imagePreview
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

const createCategory = async (req: Request, res: Response) => {
  const { image, categoryName } = req.body
  if (!categoryName) {
    throw new HttpError('Category name is required', HttpStatusCode.BAD_REQUEST)
  }

  const newCategory = await addCategory({ image, categoryName })
  res.status(HttpStatusCode.CREATED).json(newCategory)
}

const updateCategory = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id)
  const { image, categoryName } = req.body

  if (!categoryId) {
    throw new HttpError('Category ID is required', HttpStatusCode.BAD_REQUEST)
  }

  const updatedCategory = await editCategory(categoryId, {
    image,
    categoryName
  })
  res.status(HttpStatusCode.OK).json(updatedCategory)
}

const removeCategory = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id)

  if (!categoryId) {
    throw new HttpError('Category ID is required', HttpStatusCode.BAD_REQUEST)
  }

  await deleteCategory(categoryId)
  res
    .status(HttpStatusCode.OK)
    .json({ message: 'Category deleted successfully' })
}

const createBrand = async (req: Request, res: Response) => {
  const { image, brandName } = req.body
  if (!brandName) {
    throw new HttpError('Brand name is required', HttpStatusCode.BAD_REQUEST)
  }

  const newBrand = await addBrand({ image, brandName })
  res.status(HttpStatusCode.CREATED).json(newBrand)
}

const updateBrand = async (req: Request, res: Response) => {
  const brandId = Number(req.params.id)
  const { image, brandName } = req.body

  if (!brandId) {
    throw new HttpError('Brand ID is required', HttpStatusCode.BAD_REQUEST)
  }

  const updatedBrand = await editBrand(brandId, { image, brandName })
  res.status(HttpStatusCode.OK).json(updatedBrand)
}

const removeBrand = async (req: Request, res: Response) => {
  const brandId = Number(req.params.id)

  if (!brandId) {
    throw new HttpError('Brand ID is required', HttpStatusCode.BAD_REQUEST)
  }

  await deleteBrand(brandId)
  res.status(HttpStatusCode.OK).json({ message: 'Brand deleted successfully' })
}

const editProductController = async (req: Request, res: Response) => {
  try {
    const { productID } = req.params // Assuming product ID is passed as a route parameter
    const {
      name,
      image,
      price,
      color,
      category,
      brand,
      specifications,
      percent,
      imagePreview
    } = req.body

    // Validate productID
    if (!productID) {
      return res.status(400).json({ message: 'Product ID is required' })
    }

    // Construct data object
    const updateData = {
      ...(name && { name }),
      ...(image && { image }),
      ...(price && { price }),
      ...(color && { color }),
      ...(category && { category }),
      ...(brand && { brand }),
      ...(specifications && { specifications }),
      ...(percent && { percent }),
      ...(imagePreview && { imagePreview })
    }

    // Call the editProduct service
    const updatedProduct = await editProduct(Number(productID), updateData)

    if (typeof updatedProduct === 'string') {
      return res.status(400).json({ message: updatedProduct })
    }

    return res.status(200).json(updatedProduct)
  } catch (error) {
    console.error('Error in editProductController:', error)
    return res.status(500).json({ message: 'An error occurred', error })
  }
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
  addImagePreview,
  createCategory,
  updateCategory,
  removeCategory,
  createBrand,
  updateBrand,
  removeBrand,
  editProductController
}
