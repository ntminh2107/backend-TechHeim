import { getDbClient } from '@/database/connection'
import {
  tblBrands,
  tblCategories,
  tblProductPriceTag,
  tblProducts,
  tblSpecification
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
  discount?: boolean,
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

    const salePrice = (Number(price) * (1 - (percent as number) / 100))
      .toFixed(2)
      .toString()

    //insert product price...
    const insertedPrice = await trx
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
        await trx
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
  })
}

export const productDetail = async (
  productID: number
): Promise<Product | string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const productDetail = await trx
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

    const priceTag = await trx
      .select()
      .from(tblProductPriceTag)
      .where(eq(tblProductPriceTag.productID, productID))
      .limit(1)
      .then((rows) => rows[0])

    if (!priceTag)
      throw new Error(
        'something wrong when trying to get price tag for product'
      )

    const specifications = await trx
      .select({ key: tblSpecification.key, value: tblSpecification.value })
      .from(tblSpecification)
      .where(eq(tblSpecification.productID, productID))

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
    } else {
      return productResult
    }
  })
}

export const filteredbyBrand = async (
  brand: string
): Promise<Product[] | string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const filteredProduct = await trx
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
  })
}

/*TODO: do a pagination*/
export const filteredbycategory = async (
  category: string,
  queryParams: { [key: string]: string }
): Promise<Product[]> => {
  const db = getDbClient()

  return await db.transaction(async (trx) => {
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
      // eq(tblCategories.categoryName, category),
      sql`LOWER(${tblCategories.categoryName}) = ${category}`
    ]

    if (Object.keys(specFilters).length > 0) {
      const specConditions = Object.entries(specFilters).map(([key, value]) => {
        return and(
          // eq(tblSpecification.key, key),
          // eq(tblSpecification.value, value)
          sql`LOWER(${tblSpecification.key}) = ${key}`,
          sql`LOWER(${tblSpecification.value}) = ${value}`
        )
      })
      baseCondition.push(and(...specConditions) as SQL<unknown>)
    }

    if (min !== undefined && max !== undefined) {
      baseCondition.push(between(tblProductPriceTag.price, min, max))
    } else if (min !== undefined) {
      baseCondition.push(gte(tblProductPriceTag.price, min))
    } else if (max !== undefined) {
      baseCondition.push(lte(tblProductPriceTag.price, max))
    }

    const queryResult = trx
      .select({
        id: tblProducts.id,
        name: tblProducts.name,
        image: tblProducts.image,
        color: tblProducts.color,
        rating: tblProducts.rating,
        category: tblCategories.categoryName,
        brand: tblBrands.brandName,
        tblProductPriceTag
      })
      .from(tblProducts)
      .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
      .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
      .leftJoin(
        tblProductPriceTag,
        eq(tblProductPriceTag.productID, tblProducts.id)
      )
      .leftJoin(
        tblSpecification,
        eq(tblSpecification.productID, tblProducts.id)
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
        tblProductPriceTag.price,
        tblProductPriceTag.id
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
      price: product.tblProductPriceTag as PriceTag
    }))

    return result
  })
}

export const filteredFieldOptions = async (
  category: string
): Promise<{ [key: string]: string[] }> => {
  const db = getDbClient()

  return await db.transaction(async (trx) => {
    const queryResult = await trx
      .select({
        key: tblSpecification.key,
        value: tblSpecification.value
      })
      .from(tblSpecification)
      .innerJoin(tblProducts, eq(tblProducts.id, tblSpecification.productID))
      .innerJoin(tblCategories, eq(tblCategories.id, tblProducts.categoryID))
      .where(sql`LOWER(${tblCategories.categoryName}) = ${category}`)
      .groupBy(tblSpecification.key, tblSpecification.value)

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
  })
}
