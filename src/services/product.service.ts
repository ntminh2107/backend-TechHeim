import { getDbClient } from '@/database/connection'
import {
  tblBrands,
  tblCategories,
  tblProductPriceTags,
  tblProducts,
  tblSpecifications
} from '@/models/product.schema'
import { PriceTag, Product } from '@/types/product'
import { SQL, and, between, eq, gte, lte, sql } from 'drizzle-orm'

export const insertProduct = async (
  name: string,
  image: string,
  price: string,
  color: string,
  category: string,
  brand: string,
  specifications: { key: string; value: string }[],
  percent?: number
): Promise<Product | string> => {
  const db = getDbClient()

  return await db.transaction(async (trx) => {
    let categoryID
    let brandID

    //check existed category
    const existedCategory = await trx
      .select()
      .from(tblCategories)
      .where(eq(tblCategories.categoryName, category))
      .limit(1)

    if (existedCategory.length === 0) {
      const newCategory = await trx
        .insert(tblCategories)
        .values({ categoryName: category })
        .returning()

      categoryID = newCategory[0].id
    } else {
      categoryID = existedCategory[0].id
    }

    //check existed Brand
    const existedBrand = await trx
      .select()
      .from(tblBrands)
      .where(eq(tblBrands.brandName, brand))
      .limit(1)
    if (existedBrand.length === 0) {
      const newBrand = await trx
        .insert(tblBrands)
        .values({ brandName: brand })
        .returning()
      brandID = newBrand[0].id
    } else {
      brandID = existedBrand[0].id
    }

    //inserted product
    const insertedProduct = await trx
      .insert(tblProducts)
      .values({ name, image, color, categoryID, brandID })
      .returning()

    const productID = insertedProduct[0].id

    //insert product price...
    const insertedPrice = await trx
      .insert(tblProductPriceTags)
      .values({
        productID,
        price,
        percent
      })
      .returning()

    //insert product specification
    await trx
      .insert(tblSpecifications)
      .values(
        specifications.map((spec) => ({
          productID,
          key: spec.key,
          value: spec.value
        }))
      )
      .returning()

    await trx.insert(tblSpecifications).values([])

    const priceWithNumbers = insertedPrice.map((item) => ({
      ...item,
      price: Number(item.price)
    }))

    const productResult: Product = {
      id: productID,
      name,
      image,
      color,
      category,
      brand,
      price: priceWithNumbers[0] as PriceTag,
      specifications
    }

    if (productResult) {
      return productResult
    } else {
      throw new Error('insert product failed, pls try again')
    }
  })
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
    .then((rows) => rows[0])

  if (!productDetail) throw new Error('No Product found with this ID')

  const priceTag = await db
    .select()
    .from(tblProductPriceTags)
    .where(eq(tblProductPriceTags.productID, productID))
    .limit(1)
    .then((rows) => {
      const row = rows[0]
      return {
        ...row,
        price: Number(row.price)
      }
    })

  if (!priceTag)
    throw new Error('something wrong when trying to get price tag for product')

  const specifications = await db
    .select({ key: tblSpecifications.key, value: tblSpecifications.value })
    .from(tblSpecifications)
    .where(eq(tblSpecifications.productID, productID))

  const productResult: Product = {
    id: productDetail.id,
    name: productDetail.name,
    image: productDetail.image as string,
    color: productDetail.color,
    rating: Number(productDetail.rating),
    category: productDetail.category as string,
    brand: productDetail.brand as string,
    specifications: specifications as { key: string; value: string }[],
    price: priceTag as PriceTag
  }
  if (!productResult) {
    throw new Error('something wrong when trying to render product detail')
  }
  return productResult
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

/*TODO: do a pagination*/
export const filteredbycategory = async (
  category: string,
  queryParams: { [key: string]: string }
): Promise<Product[]> => {
  const db = getDbClient()
  const min = queryParams.min
  const max = queryParams.max
  const limit = 3
  const page = Number(queryParams.page) || 1
  const offset = (page - 1) * limit
  const specFilters = { ...queryParams }

  delete specFilters.min
  delete specFilters.max
  delete specFilters.page
  delete specFilters.limit
  const baseCondition = [
    sql`LOWER(${tblCategories.categoryName}) = ${category}`
  ]

  if (Object.keys(specFilters).length > 0) {
    const specConditions = Object.entries(specFilters).map(([key, value]) => {
      return and(
        sql`LOWER(${tblSpecifications.key}) = ${key}`,
        sql`LOWER(${tblSpecifications.value}) = ${value}`
      )
    })
    baseCondition.push(and(...specConditions) as SQL<unknown>)
  }

  if (min !== undefined && max !== undefined) {
    baseCondition.push(between(tblProductPriceTags.price, min, max))
  } else if (min !== undefined) {
    baseCondition.push(gte(tblProductPriceTags.price, min))
  } else if (max !== undefined) {
    baseCondition.push(lte(tblProductPriceTags.price, max))
  }

  const queryResult = db
    .select({
      id: tblProducts.id,
      name: tblProducts.name,
      image: tblProducts.image,
      color: tblProducts.color,
      rating: tblProducts.rating,
      category: tblCategories.categoryName,
      brand: tblBrands.brandName,
      priceTagID: tblProductPriceTags.id,
      price: tblProductPriceTags.price,

      percent: tblProductPriceTags.percent
    })
    .from(tblProducts)
    .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
    .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
    .leftJoin(
      tblProductPriceTags,
      eq(tblProductPriceTags.productID, tblProducts.id)
    )
    .leftJoin(
      tblSpecifications,
      eq(tblSpecifications.productID, tblProducts.id)
    )
    .where(and(...baseCondition))
    .groupBy(
      tblProducts.id,
      tblProducts.name,
      tblProducts.image,
      tblProducts.color,
      tblProducts.rating,
      tblCategories.categoryName,
      tblBrands.brandName,
      tblProductPriceTags.price,
      tblProductPriceTags.id
    )
    .limit(limit)
    .offset(offset)

  const result: Product[] = (await queryResult).map((product) => ({
    id: product.id,
    name: product.name,
    image: product.image as string,
    color: product.color as string,
    rating: Number(product.rating),
    category: product.category as string,
    brand: product.brand as string,
    price: {
      id: product.priceTagID as number,
      productID: product.id,
      price: Number(product.price),

      percent: product.percent as number
    }
  }))

  return result
}

export const filteredFieldOptions = async (
  category: string
): Promise<{ [key: string]: string[] }> => {
  const db = getDbClient()
  const queryResult = await db
    .select({
      key: tblSpecifications.key,
      value: tblSpecifications.value
    })
    .from(tblSpecifications)
    .innerJoin(tblProducts, eq(tblProducts.id, tblSpecifications.productID))
    .innerJoin(tblCategories, eq(tblCategories.id, tblProducts.categoryID))
    .where(sql`LOWER(${tblCategories.categoryName}) = ${category}`)
    .groupBy(tblSpecifications.key, tblSpecifications.value)

  const result: { [key: string]: string[] } = {}

  queryResult.forEach((spec) => {
    const key = spec.key as string
    const value = spec.value as string
    if (!result[key]) {
      result[key] = []
    }
    if (!result[key].includes(value)) {
      result[key].push(value)
    }
  })

  return result
}
