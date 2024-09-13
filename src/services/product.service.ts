import { getDbClient } from '@/database/connection'
import {
  tblBrands,
  tblCategories,
  tblProductPriceTag,
  tblProducts,
  tblSpecification
} from '@/models/product.schema'
import { PriceTag, Product } from '@/types/product'
import { SQL, and, between, eq, gte, lte } from 'drizzle-orm'

export const insertProduct = async (
  name: string,
  image: string,
  price: string,
  color: string,
  category: string,
  brand: string,
  specifications: { key: string; value: string }[],
  discount?: boolean,
  percent?: number
): Promise<Product | string> => {
  const db = getDbClient()

  let categoryID
  let brandID

  //check existed category
  const existedCategory = await db
    .select()
    .from(tblCategories)
    .where(eq(tblCategories.categoryName, category))
    .limit(1)

  if (existedCategory.length === 0) {
    const newCategory = await db
      .insert(tblCategories)
      .values({ categoryName: category })
      .returning()

    categoryID = newCategory[0].id
  } else {
    categoryID = existedCategory[0].id
  }

  //check existed Brand
  const existedBrand = await db
    .select()
    .from(tblBrands)
    .where(eq(tblBrands.brandName, brand))
    .limit(1)
  if (existedBrand.length === 0) {
    const newBrand = await db
      .insert(tblBrands)
      .values({ brandName: brand })
      .returning()
    brandID = newBrand[0].id
  } else {
    brandID = existedBrand[0].id
  }

  //inserted product
  const insertedProduct = await db
    .insert(tblProducts)
    .values({ name, image, color, categoryID, brandID })
    .returning()

  const productID = insertedProduct[0].id

  const salePrice = (Number(price) * (1 - (percent as number) / 100))
    .toFixed(2)
    .toString()

  //insert product price...
  const insertedPrice = await db
    .insert(tblProductPriceTag)
    .values({
      productID,
      price,
      discount,
      percent,
      salePrice
    })
    .returning()

  //insert product specification
  Promise.all(
    specifications.map(async (spec) => {
      await db
        .insert(tblSpecification)
        .values({
          productID,
          key: spec.key,
          value: spec.value
        })
        .returning()
    })
  )

  const productResult: Product = {
    id: productID,
    name,
    image,
    color,
    category,
    brand,
    price: insertedPrice[0] as PriceTag,
    specifications
  }

  if (productResult) {
    return productResult
  } else {
    throw new Error('insert product failed, pls try again')
  }
}

export const productDetail = async (
  productID: number
): Promise<Product | string> => {
  const db = getDbClient()

  const productDetail = await db
    .select({
      id: tblProducts.id,
      name: tblProducts.name,
      image: tblProducts.image,
      color: tblProducts.color,
      rating: tblProducts.rating,
      category: tblCategories.categoryName,
      brand: tblBrands.brandName
    })
    .from(tblProducts)
    .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
    .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
    .where(eq(tblProducts.id, productID))
    .limit(1)

  if (!productDetail) throw new Error('No Product found with this ID')

  const priceTag = await db
    .select()
    .from(tblProductPriceTag)
    .where(eq(tblProductPriceTag.productID, productID))
    .limit(1)

  if (!priceTag)
    throw new Error('something wrong when trying to get price tag for product')

  const specifications = await db
    .select({ key: tblSpecification.key, value: tblSpecification.value })
    .from(tblSpecification)
    .where(eq(tblSpecification.productID, productID))

  const productResult: Product = {
    id: productDetail[0].id,
    name: productDetail[0].name,
    image: productDetail[0].image as string,
    color: productDetail[0].color,
    rating: Number(productDetail[0].rating),
    category: productDetail[0].category as string,
    brand: productDetail[0].brand as string,
    specifications: specifications as { key: string; value: string }[],
    price: priceTag[0] as PriceTag
  }
  if (!productResult) {
    throw new Error('something wrong when trying to render product detail')
  } else {
    return productResult
  }
}

export const filteredbyBrand = async (
  brand: string
): Promise<Product[] | string> => {
  const db = getDbClient()

  const filteredProduct = await db
    .select({
      id: tblProducts.id,
      name: tblProducts.name,
      image: tblProducts.image,
      color: tblProducts.color,
      rating: tblProducts.rating,
      category: tblCategories.categoryName,
      brand: tblBrands.brandName
    })
    .from(tblProducts)
    .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
    .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
    .where(eq(tblBrands.brandName, brand))

  if (filteredProduct.length === 0) return 'no product found'

  const result: Product[] = filteredProduct.map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image as string,
    color: product.color,
    rating: Number(product.rating),
    category: product.category as string,
    brand: product.brand as string
  }))

  return result
}

export const filteredbyCategory = async (
  category: string,
  queryParams: { [key: string]: string }
): Promise<Product[] | string> => {
  const db = getDbClient()

  const filteredProduct = await db
    .select({
      id: tblProducts.id,
      name: tblProducts.name,
      image: tblProducts.image,
      color: tblProducts.color,
      rating: tblProducts.rating,
      category: tblCategories.categoryName,
      brand: tblBrands.brandName
    })
    .from(tblProducts)
    .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
    .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
    .where(eq(tblCategories.categoryName, category))

  if (filteredProduct.length === 0) return 'no product found'

  const result: Product[] = filteredProduct.map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image as string,
    color: product.color,
    rating: Number(product.rating),
    category: product.category as string,
    brand: product.brand as string
  }))

  return result
}

/*TODO: do a query that need to filtered spec and min-max price*/
export const filteredByQueryParams = async (
  category: string,
  queryParams: { [key: string]: string }
): Promise<Product | string> => {
  const db = getDbClient()

  const min = queryParams.min ? Number(queryParams.min) : undefined
  const max = queryParams.max ? Number(queryParams.max) : undefined

  const specFilters = { ...queryParams }
  delete specFilters.min
  delete specFilters.max

  const baseCondition = [eq(tblCategories.categoryName, category)]

  if (Object.keys(specFilters).length > 0) {
    const specConditions = Object.entries(specFilters).map(([key, value]) => {
      return and(
        eq(tblSpecification.key, key),
        eq(tblSpecification.value, value)
      )
    })
    baseCondition.push(and(...specConditions) as SQL<unknown>)
  }

  // if (min !== undefined && max !== undefined) {
  //   baseCondition.push(between(Number(tblProductPriceTag.price), min, max))
  // } else if (min !== undefined) {
  //   baseCondition.push(Number(tblProductPriceTag.price).(Number(min)))
  // } else if (max !== undefined) {
  //   baseCondition.push(Number(tblProductPriceTag.price).lte(max))
  // }

  let queryResult = db
    .select({
      id: tblProducts.id,
      name: tblProducts.name,
      image: tblProducts.image,
      color: tblProducts.color,
      rating: tblProducts.rating,
      category: tblCategories.categoryName,
      brand: tblBrands.brandName
    })
    .from(tblProducts)
    .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
    .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
    .where(eq(tblCategories.categoryName, category))

  return ''
}
