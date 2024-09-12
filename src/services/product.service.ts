// import { getDbClient } from '@/database/connection'
// import { tblBrands, tblCategories, tblProducts } from '@/models/product.schema'
// import { Specification } from '@/types/product'
// import { eq } from 'drizzle-orm'

// export const insertProduct = async (
//   name: string,
//   image: string,
//   price: number,
//   color: string,
//   category: string,
//   brand: string,
//   specifications: Specification[],
//   discount: boolean,
//   percent: number,
//   salePrice: number
// ): Promise<string> => {
//   const db = getDbClient()

//   let categoryID
//   let brandID

//   //check existed category
//   const existedCategory = await db
//     .select()
//     .from(tblCategories)
//     .where(eq(tblCategories.categoryName, category))
//     .limit(1)

//   if (existedCategory.length === 0) {
//     const newCategory = await db
//       .insert(tblCategories)
//       .values({ categoryName: category, totalProducts: 1 })
//       .returning()

//     categoryID = newCategory[0].id
//   } else {
//     categoryID = existedCategory[0].id

//     await db
//       .update(tblCategories)
//       .set({
//         totalProducts: (existedCategory[0].totalProducts as number) + 1
//       })
//       .where(eq(tblCategories.categoryName, category))
//   }

//   //check existed Brand
//   const existedBrand = await db
//     .select()
//     .from(tblBrands)
//     .where(eq(tblBrands.brandName, brand))
//     .limit(1)
//   if (existedBrand.length === 0) {
//     const newBrand = await db
//       .insert(tblBrands)
//       .values({ brandName: brand, totalProducts: 1 })
//       .returning()
//     brandID = newBrand[0].id
//   } else {
//     brandID = existedBrand[0].id

//     await db
//       .update(tblBrands)
//       .set({
//         totalProducts: (existedBrand[0].totalProducts as number) + 1
//       })
//       .where(eq(tblBrands.brandName, brand))
//   }

//   const productSchemaValue = {
//     name,
//     image,
//     price,
//     color,
//     categoryID,
//     brandID,
//     specifications,
//     discount,
//     percent,
//     salePrice
//   }

//   const productResult = await db
//     .insert(tblProducts)
//     .values(productSchemaValue)
//     .returning()

//   const productID = productResult[0].id

//   return 'add successs'
// }
