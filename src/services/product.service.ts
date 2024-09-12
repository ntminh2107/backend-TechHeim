import { getDbClient } from '@/database/connection'
import {
  tblBrands,
  tblCategories,
  tblProductPriceTag,
  tblProducts,
  tblSpecification
} from '@/models/product.schema'
import { PriceTag, Product } from '@/types/product'
import { eq } from 'drizzle-orm'

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
      .values({ categoryName: category, totalProducts: 1 })
      .returning()

    categoryID = newCategory[0].id
  } else {
    categoryID = existedCategory[0].id

    await db
      .update(tblCategories)
      .set({
        totalProducts: (existedCategory[0].totalProducts as number) + 1
      })
      .where(eq(tblCategories.categoryName, category))
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
      .values({ brandName: brand, totalProducts: 1 })
      .returning()
    brandID = newBrand[0].id
  } else {
    brandID = existedBrand[0].id

    await db
      .update(tblBrands)
      .set({
        totalProducts: (existedBrand[0].totalProducts as number) + 1
      })
      .where(eq(tblBrands.brandName, brand))
  }

  //inserted product
  const insertedProduct = await db
    .insert(tblProducts)
    .values({ name, image, color, categoryID, brandID })
    .returning()

  const productID = insertedProduct[0].id

  const salePrice = (+price - (1 - (percent as number) / 100)).toString()

  //insert product price
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
        .values({ productID, key: spec.key, value: spec.value }).returning
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
