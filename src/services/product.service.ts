import { getDbClient } from '@/database/connection'
import {
  tblBrands,
  tblCategories,
  tblCommentProducts,
  tblProductPriceTags,
  tblProducts,
  tblSpecifications
} from '@/models/product.schema'
import { Brand, Category, Comments, PriceTag, Product } from '@/types/product'
import {
  SQL,
  and,
  between,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  or,
  sql
} from 'drizzle-orm'

export const insertProduct = async (
  name: string,
  image: string,
  price: number,
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
        price: price.toString(),
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
      brand: tblBrands.brandName,
      imagePreview: tblProducts.imageReview
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
    price: priceTag as PriceTag,
    imagePreview: productDetail.imagePreview as string[]
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
  const discount = queryParams.discount === 'true'
  const specFilters = { ...queryParams }

  delete specFilters.min
  delete specFilters.max
  delete specFilters.page
  delete specFilters.limit
  delete specFilters.discount
  const baseCondition = [
    sql`LOWER(${tblCategories.categoryName}) = LOWER (${category})`
  ]

  if (Object.keys(specFilters).length > 0) {
    const specConditions = Object.entries(specFilters).map(([key, value]) => {
      const values = value.split(',').map((val) => val.trim())
      return and(
        // sql`LOWER(${tblSpecifications.key} = LOWER(${key})`,
        // sql`LOWER(${tblSpecifications.value}) = LOWER(${value})`
        eq(tblSpecifications.key, key),
        inArray(tblSpecifications.value, values)
      )
    })
    baseCondition.push(or(...specConditions) as SQL<unknown>)
  }

  if (min !== undefined && max !== undefined) {
    baseCondition.push(between(tblProductPriceTags.price, min, max))
  } else if (min !== undefined) {
    baseCondition.push(gte(tblProductPriceTags.price, min))
  } else if (max !== undefined) {
    baseCondition.push(lte(tblProductPriceTags.price, max))
  }

  if (discount) {
    baseCondition.push(isNotNull(tblProductPriceTags.percent))
  }

  const queryResult = await db
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
): Promise<{ key: string; value: string[] }[]> => {
  const db = getDbClient()

  const queryResult = await db
    .select({
      key: tblSpecifications.key,
      value: tblSpecifications.value
    })
    .from(tblSpecifications)
    .innerJoin(tblProducts, eq(tblProducts.id, tblSpecifications.productID))
    .innerJoin(tblCategories, eq(tblCategories.id, tblProducts.categoryID))
    .where(
      sql`LOWER(${tblCategories.categoryName}) = ${category.toLowerCase()}`
    )
    .groupBy(tblSpecifications.key, tblSpecifications.value)

  const resultMap: Map<string, Set<string>> = new Map()

  queryResult.forEach((spec) => {
    const key = spec.key as string
    const value = spec.value as string

    if (!resultMap.has(key)) {
      resultMap.set(key, new Set())
    }

    resultMap.get(key)?.add(value)
  })

  const result = Array.from(resultMap.entries()).map(([key, valueSet]) => ({
    key,
    value: Array.from(valueSet)
  }))

  return result
}

export const insertCommentOnProduct = async (
  userID: string,
  productID: number,
  content: string,
  rating: number
): Promise<Comments | string> => {
  const db = getDbClient()

  return await db.transaction(async (trx) => {
    const insertCmt = await trx
      .insert(tblCommentProducts)
      .values({
        productID,
        userID,
        content,
        rating: rating.toString()
      })
      .returning()

    if (!insertCmt)
      throw new Error('somthing wrong happens went trying to insert to db')
    const rs: Comments = {
      id: insertCmt[0].id,
      date: insertCmt[0].date as Date,
      userID: insertCmt[0].userID as string,
      productID: insertCmt[0].productID as number,
      content: insertCmt[0].content as string,
      rating: Number(insertCmt[0].rating)
    }

    return rs
  })
}

export const selectProductComments = async (
  productID: number
): Promise<Comments[] | string> => {
  const db = getDbClient()

  const query = await db
    .select()
    .from(tblCommentProducts)
    .where(eq(tblCommentProducts.productID, productID))

  const rs: Comments[] = query.map((cmt) => ({
    id: cmt.id,
    date: cmt.date as Date,
    userID: cmt.userID as string,
    productID: cmt.productID as number,
    content: cmt.content as string,
    rating: Number(cmt.rating)
  }))
  return rs
}

export const getAllProduct = async (
  limit?: number,
  offset?: number
): Promise<Product[] | string> => {
  const db = getDbClient()
  let query

  if (limit || offset) {
    query = db
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
      .leftJoin(
        tblProductPriceTags,
        eq(tblProductPriceTags.productID, tblProducts.id)
      )
      .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
      .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
      .leftJoin(
        tblSpecifications,
        eq(tblSpecifications.productID, tblProducts.id)
      )
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
      .limit(limit as number)
      .offset(offset as number)
  } else {
    query = db
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
      .leftJoin(
        tblProductPriceTags,
        eq(tblProductPriceTags.productID, tblProducts.id)
      )
      .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
      .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
      .leftJoin(
        tblSpecifications,
        eq(tblSpecifications.productID, tblProducts.id)
      )
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
  }

  // Execute the query
  const result: Product[] = (await query).map((product) => ({
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

export const searchProductsByName = async (
  search: string
): Promise<Product[]> => {
  const db = getDbClient()

  const lowerSearchQr = search.toLowerCase()

  const condition = sql`LOWER(${tblProducts.name}) LIKE LOWER(${`%${lowerSearchQr}%`}) OR
    LOWER(${tblCategories.categoryName}) LIKE LOWER(${`%${lowerSearchQr}%`}) OR
    LOWER(${tblBrands.brandName}) LIKE LOWER(${`%${lowerSearchQr}%`})`

  const query = await db
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
    .leftJoin(
      tblProductPriceTags,
      eq(tblProductPriceTags.productID, tblProducts.id)
    )
    .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
    .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
    .leftJoin(
      tblSpecifications,
      eq(tblSpecifications.productID, tblProducts.id)
    )
    .where(condition)
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

  const result: Product[] = (await query).map((product) => ({
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

export const getSaleProducts = async (
  limit: number | 10
): Promise<Product[] | string> => {
  const db = getDbClient()

  const query = await db
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
    .leftJoin(
      tblProductPriceTags,
      eq(tblProductPriceTags.productID, tblProducts.id)
    )
    .leftJoin(tblBrands, eq(tblProducts.brandID, tblBrands.id))
    .leftJoin(tblCategories, eq(tblProducts.categoryID, tblCategories.id))
    .leftJoin(
      tblSpecifications,
      eq(tblSpecifications.productID, tblProducts.id)
    )
    .where(isNotNull(tblProductPriceTags.percent))
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

  const result: Product[] = (await query).map((product) => ({
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

export const getBrands = async (): Promise<Brand[]> => {
  const db = getDbClient()
  const query = await db
    .select({
      id: tblBrands.id,
      brandName: tblBrands.brandName,
      image: tblBrands.image
    })
    .from(tblBrands)
  return query as Brand[]
}

export const getCategories = async (): Promise<Category[] | string> => {
  const db = getDbClient()
  const query = await db.select().from(tblCategories)
  return query as Category[]
}

export const addImagePreviews = async (
  productID: number,
  imagePreview: string[]
): Promise<string> => {
  const db = getDbClient()
  return await db.transaction(async (trx) => {
    const query = await trx
      .update(tblProducts)
      .set({ imageReview: imagePreview })
      .where(eq(tblProducts.id, productID))

    if (!query) throw new Error('error when trying to update image preview')
    return 'success'
  })
}
