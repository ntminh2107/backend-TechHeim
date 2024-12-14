import { getDbClient } from '@/database/connection'
import {
  tblBrands,
  tblCategories,
  tblCommentProducts,
  tblProductPriceTags,
  tblProducts,
  tblSpecifications
} from '@/models/product.schema'
import { tblUsers } from '@/models/user.schema'
import { Brand, Category, Comments, PriceTag, Product } from '@/types/product'
import {
  SQL,
  and,
  asc,
  between,
  count,
  desc,
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
  percent?: number,
  imagePreview?: string[]
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
      .values({
        name,
        image,
        color,
        categoryID,
        brandID,
        imageReview: imagePreview
      })
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

export const editProduct = async (
  productID: number,
  data: {
    name?: string
    image?: string
    price?: number
    color?: string
    category?: string
    brand?: string
    specifications?: { key: string; value: string }[]
    percent?: number
    imagePreview?: string[]
  }
): Promise<Product | string> => {
  const db = getDbClient()

  return await db.transaction(async (trx) => {
    let categoryID
    let brandID

    // Update category if provided
    if (data.category) {
      const existedCategory = await trx
        .select()
        .from(tblCategories)
        .where(eq(tblCategories.categoryName, data.category))
        .limit(1)

      if (existedCategory.length === 0) {
        const newCategory = await trx
          .insert(tblCategories)
          .values({ categoryName: data.category })
          .returning()
        categoryID = newCategory[0].id
      } else {
        categoryID = existedCategory[0].id
      }
    }

    // Update brand if provided
    if (data.brand) {
      const existedBrand = await trx
        .select()
        .from(tblBrands)
        .where(eq(tblBrands.brandName, data.brand))
        .limit(1)

      if (existedBrand.length === 0) {
        const newBrand = await trx
          .insert(tblBrands)
          .values({ brandName: data.brand })
          .returning()
        brandID = newBrand[0].id
      } else {
        brandID = existedBrand[0].id
      }
    }

    // Update product details
    await trx
      .update(tblProducts)
      .set({
        name: data.name,
        image: data.image,
        color: data.color,
        categoryID,
        brandID,
        imageReview: data.imagePreview
      })
      .where(eq(tblProducts.id, productID))

    // Update or insert price tag
    if (data.price !== undefined) {
      await trx
        .update(tblProductPriceTags)
        .set({
          price: data.price.toString(),
          percent: data.percent
        })
        .where(eq(tblProductPriceTags.productID, productID))
    }

    // Update product specifications
    if (data.specifications && data.specifications.length > 0) {
      // Delete existing specifications
      await trx
        .delete(tblSpecifications)
        .where(eq(tblSpecifications.productID, productID))

      // Insert new specifications
      await trx.insert(tblSpecifications).values(
        data.specifications.map((spec) => ({
          productID,
          key: spec.key,
          value: spec.value
        }))
      )
    }

    // Retrieve and return the updated product details
    const updatedProduct = await productDetail(productID)
    return updatedProduct
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
    and(
      sql`LOWER(${tblCategories.categoryName}) = LOWER (${category})`,
      eq(tblProducts.isDeleted, false)
    )
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

export const filteredbycategoryPagination = async (
  category: string,
  queryParams: { [key: string]: string }
): Promise<{
  meta: {
    page: number
    page_size: number
    total_pages: number
    total: number
  }
  data: Product[]
}> => {
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
    sql`LOWER(${tblCategories.categoryName}) = LOWER (${category})`,
    eq(tblProducts.isDeleted, false)
  ]

  if (Object.keys(specFilters).length > 0) {
    const specConditions = Object.entries(specFilters).map(([key, value]) => {
      const values = value.split(',').map((val) => val.trim())
      return and(
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

  const page = Number(queryParams.page) || 1
  const pageSize = Number(queryParams.limit) || 10
  console.log('page: ', page, 'pageSize: ', pageSize)
  const offset = (page - 1) * pageSize

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
    .limit(pageSize)
    .offset(offset)
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

  const totalProducts = await db
    .select({ count: count(tblProducts.id) })
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
    .then((row) => row[0])

  const total = totalProducts.count
  const totalPages = Math.ceil(total / pageSize)

  return {
    meta: {
      page, // Current page
      page_size: pageSize, // Number of items per page
      total_pages: totalPages, // Total number of pages
      total // Total number of matching products
    },
    data: result // The filtered products
  }
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

    const getUserEmail = await trx
      .select({ email: tblUsers.email })
      .from(tblUsers)
      .where(eq(tblUsers.id, userID))
      .limit(1)
      .then((rows) => rows[0])

    if (!insertCmt)
      throw new Error('somthing wrong happens went trying to insert to db')
    const rs: Comments = {
      id: insertCmt[0].id,
      date: insertCmt[0].date as Date,
      email: getUserEmail.email as string,
      productID: insertCmt[0].productID as number,
      content: insertCmt[0].content as string,
      rating: Number(insertCmt[0].rating)
    }

    const ratings = await trx
      .select({ rating: tblCommentProducts.rating })
      .from(tblCommentProducts)
      .where(eq(tblCommentProducts.productID, productID))

    if (ratings.length === 0) {
      throw new Error('No ratings found for the product')
    }

    // Calculate average rating
    const averageRating =
      ratings.reduce(
        (sum, rs) => sum + parseFloat(rs.rating?.toString() as string),
        0
      ) / ratings.length

    await trx
      .update(tblProducts)
      .set({ rating: averageRating.toString() })
      .where(eq(tblProducts.id, productID))

    return rs
  })
}

export const selectProductComments = async (
  productID: number
): Promise<Comments[] | string> => {
  const db = getDbClient()

  const query = await db
    .select({ tblCommentProducts, email: tblUsers.email })
    .from(tblCommentProducts)
    .innerJoin(tblUsers, eq(tblUsers.id, tblCommentProducts.userID))
    .where(eq(tblCommentProducts.productID, productID))

  const rs: Comments[] = query.map((cmt) => ({
    id: cmt.tblCommentProducts.id,
    date: cmt.tblCommentProducts.date as Date,
    email: cmt.email as string,
    productID: cmt.tblCommentProducts.productID as number,
    content: cmt.tblCommentProducts.content as string,
    rating: Number(cmt.tblCommentProducts.rating)
  }))
  return rs
}

export const getAllProduct = async (
  page: number,
  pageSize: number,
  sortOrder: 'asc' | 'desc' = 'asc', // Optional sortOrder, default is 'asc'
  searchQuery: string // Optional search query to filter by product name
): Promise<{
  data: Product[]
  metadata: {
    page: number
    page_limit: number
    total_pages: number
    total: number
  }
}> => {
  const db = getDbClient()

  const lowerSearchQr = searchQuery.toLowerCase()

  // Build the search condition based on the query
  const condition = sql`LOWER(${tblProducts.name}) LIKE LOWER(${`%${lowerSearchQr}%`}) OR
    LOWER(${tblCategories.categoryName}) LIKE LOWER(${`%${lowerSearchQr}%`}) OR
    LOWER(${tblBrands.brandName}) LIKE LOWER(${`%${lowerSearchQr}%`})`

  // Add the condition to exclude deleted products
  const baseCondition = and(
    condition,
    eq(tblProducts.isDeleted, false) // Exclude deleted products
  )

  // Build the initial query with pagination
  let query = db
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
      percent: tblProductPriceTags.percent,
      count: count(tblProducts.id)
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
    .where(baseCondition) // Apply the condition to exclude deleted products

  // Sort the products based on the sortOrder
  if (sortOrder === 'asc') {
    query.orderBy(asc(tblProductPriceTags.price)) // Ascending order
  } else {
    query.orderBy(desc(tblProductPriceTags.price)) // Descending order
  }

  // Apply pagination limit and offset
  query.limit(pageSize).offset((page - 1) * pageSize)

  const total = await db
    .select({ count: count(tblProducts.id) })
    .from(tblProducts)
    .where(eq(tblProducts.isDeleted, false))
    .then((row) => row[0])

  const totalPages = Math.ceil(total.count / pageSize)

  // Execute the queries to get the products
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

  const metadata = {
    page: page, // Current page (1-indexed)
    page_limit: pageSize, // Limit per page
    total_pages: totalPages, // Total pages
    total: total.count // Total number of products
  }

  // Return the result and metadata
  return {
    data: result,
    metadata
  }
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

export const addCategory = async (data: {
  image: string
  categoryName: string
}) => {
  const db = getDbClient()

  const [newCategory] = await db
    .insert(tblCategories)
    .values({
      image: data.image,
      categoryName: data.categoryName
    })
    .returning()
  return newCategory
}

// Edit an existing category
export const editCategory = async (
  categoryId: number,
  data: { image?: string; categoryName?: string }
) => {
  const db = getDbClient()
  const [updatedCategory] = await db
    .update(tblCategories)
    .set({
      ...(data.image && { image: data.image }),
      ...(data.categoryName && { categoryName: data.categoryName })
    })
    .where(eq(tblCategories.id, categoryId))
    .returning()
  return updatedCategory
}

// Delete a category
export const deleteCategory = async (categoryId: number) => {
  const db = getDbClient()
  await db.delete(tblCategories).where(eq(tblCategories.id, categoryId))
  return { message: 'Category deleted successfully' }
}

export const addBrand = async (data: { image: string; brandName: string }) => {
  const db = getDbClient()

  const [newBrand] = await db
    .insert(tblBrands)
    .values({
      image: data.image,
      brandName: data.brandName
    })
    .returning()
  return newBrand
}

// Edit an existing brand
export const editBrand = async (
  brandId: number,
  data: { image?: string; brandName?: string }
) => {
  const db = getDbClient()

  const [updatedBrand] = await db
    .update(tblBrands)
    .set({
      ...(data.image && { image: data.image }),
      ...(data.brandName && { brandName: data.brandName })
    })
    .where(eq(tblBrands.id, brandId))
    .returning()
  return updatedBrand
}

// Delete a brand
export const deleteBrand = async (brandId: number) => {
  const db = getDbClient()

  await db.delete(tblBrands).where(eq(tblBrands.id, brandId))
  return { message: 'Brand deleted successfully' }
}

export const deleteProduct = async (productId: number) => {
  const db = getDbClient()
  const rs = await db
    .update(tblProducts)
    .set({ isDeleted: true })
    .where(eq(tblProducts.id, productId))

  return `${rs} success`
}
