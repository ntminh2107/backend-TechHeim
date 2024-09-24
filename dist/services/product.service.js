"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filteredFieldOptions = exports.filteredbycategory = exports.filteredbyBrand = exports.productDetail = exports.insertProduct = void 0;
const connection_1 = require("@/database/connection");
const product_schema_1 = require("@/models/product.schema");
const drizzle_orm_1 = require("drizzle-orm");
const insertProduct = async (name, image, price, color, category, brand, specifications, percent) => {
    const db = (0, connection_1.getDbClient)();
    return await db.transaction(async (trx) => {
        let categoryID;
        let brandID;
        //check existed category
        const existedCategory = await trx
            .select()
            .from(product_schema_1.tblCategories)
            .where((0, drizzle_orm_1.eq)(product_schema_1.tblCategories.categoryName, category))
            .limit(1);
        if (existedCategory.length === 0) {
            const newCategory = await trx
                .insert(product_schema_1.tblCategories)
                .values({ categoryName: category })
                .returning();
            categoryID = newCategory[0].id;
        }
        else {
            categoryID = existedCategory[0].id;
        }
        //check existed Brand
        const existedBrand = await trx
            .select()
            .from(product_schema_1.tblBrands)
            .where((0, drizzle_orm_1.eq)(product_schema_1.tblBrands.brandName, brand))
            .limit(1);
        if (existedBrand.length === 0) {
            const newBrand = await trx
                .insert(product_schema_1.tblBrands)
                .values({ brandName: brand })
                .returning();
            brandID = newBrand[0].id;
        }
        else {
            brandID = existedBrand[0].id;
        }
        //inserted product
        const insertedProduct = await trx
            .insert(product_schema_1.tblProducts)
            .values({ name, image, color, categoryID, brandID })
            .returning();
        const productID = insertedProduct[0].id;
        //insert product price...
        const insertedPrice = await trx
            .insert(product_schema_1.tblProductPriceTag)
            .values({
            productID,
            price,
            percent
        })
            .returning();
        //insert product specification
        await trx
            .insert(product_schema_1.tblSpecification)
            .values(specifications.map((spec) => ({
            productID,
            key: spec.key,
            value: spec.value
        })))
            .returning();
        await trx.insert(product_schema_1.tblSpecification).values([]);
        const priceWithNumbers = insertedPrice.map((item) => ({
            ...item,
            price: Number(item.price)
        }));
        const productResult = {
            id: productID,
            name,
            image,
            color,
            category,
            brand,
            price: priceWithNumbers[0],
            specifications
        };
        if (productResult) {
            return productResult;
        }
        else {
            throw new Error('insert product failed, pls try again');
        }
    });
};
exports.insertProduct = insertProduct;
const productDetail = async (productID) => {
    const db = (0, connection_1.getDbClient)();
    const productDetail = await db
        .select({
        id: product_schema_1.tblProducts.id,
        name: product_schema_1.tblProducts.name,
        image: product_schema_1.tblProducts.image,
        color: product_schema_1.tblProducts.color,
        rating: product_schema_1.tblProducts.rating,
        category: product_schema_1.tblCategories.categoryName,
        brand: product_schema_1.tblBrands.brandName
    })
        .from(product_schema_1.tblProducts)
        .leftJoin(product_schema_1.tblCategories, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.categoryID, product_schema_1.tblCategories.id))
        .leftJoin(product_schema_1.tblBrands, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.brandID, product_schema_1.tblBrands.id))
        .where((0, drizzle_orm_1.eq)(product_schema_1.tblProducts.id, productID))
        .limit(1)
        .then((rows) => rows[0]);
    if (!productDetail)
        throw new Error('No Product found with this ID');
    const priceTag = await db
        .select()
        .from(product_schema_1.tblProductPriceTag)
        .where((0, drizzle_orm_1.eq)(product_schema_1.tblProductPriceTag.productID, productID))
        .limit(1)
        .then((rows) => {
        const row = rows[0];
        return {
            ...row,
            price: Number(row.price)
        };
    });
    if (!priceTag)
        throw new Error('something wrong when trying to get price tag for product');
    const specifications = await db
        .select({ key: product_schema_1.tblSpecification.key, value: product_schema_1.tblSpecification.value })
        .from(product_schema_1.tblSpecification)
        .where((0, drizzle_orm_1.eq)(product_schema_1.tblSpecification.productID, productID));
    const productResult = {
        id: productDetail.id,
        name: productDetail.name,
        image: productDetail.image,
        color: productDetail.color,
        rating: Number(productDetail.rating),
        category: productDetail.category,
        brand: productDetail.brand,
        specifications: specifications,
        price: priceTag
    };
    if (!productResult) {
        throw new Error('something wrong when trying to render product detail');
    }
    return productResult;
};
exports.productDetail = productDetail;
const filteredbyBrand = async (brand) => {
    const db = (0, connection_1.getDbClient)();
    const filteredProduct = await db
        .select({
        id: product_schema_1.tblProducts.id,
        name: product_schema_1.tblProducts.name,
        image: product_schema_1.tblProducts.image,
        color: product_schema_1.tblProducts.color,
        rating: product_schema_1.tblProducts.rating,
        category: product_schema_1.tblCategories.categoryName,
        brand: product_schema_1.tblBrands.brandName
    })
        .from(product_schema_1.tblProducts)
        .leftJoin(product_schema_1.tblCategories, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.categoryID, product_schema_1.tblCategories.id))
        .leftJoin(product_schema_1.tblBrands, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.brandID, product_schema_1.tblBrands.id))
        .where((0, drizzle_orm_1.eq)(product_schema_1.tblBrands.brandName, brand));
    if (filteredProduct.length === 0)
        return 'no product found';
    const result = filteredProduct.map((product) => ({
        id: product.id,
        name: product.name,
        image: product.image,
        color: product.color,
        rating: Number(product.rating),
        category: product.category,
        brand: product.brand
    }));
    return result;
};
exports.filteredbyBrand = filteredbyBrand;
/*TODO: do a pagination*/
const filteredbycategory = async (category, queryParams) => {
    const db = (0, connection_1.getDbClient)();
    const min = queryParams.min;
    const max = queryParams.max;
    const limit = 3;
    const page = Number(queryParams.page) || 1;
    const offset = (page - 1) * limit;
    const specFilters = { ...queryParams };
    delete specFilters.min;
    delete specFilters.max;
    delete specFilters.page;
    delete specFilters.limit;
    const baseCondition = [
        (0, drizzle_orm_1.sql) `LOWER(${product_schema_1.tblCategories.categoryName}) = ${category}`
    ];
    if (Object.keys(specFilters).length > 0) {
        const specConditions = Object.entries(specFilters).map(([key, value]) => {
            return (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `LOWER(${product_schema_1.tblSpecification.key}) = ${key}`, (0, drizzle_orm_1.sql) `LOWER(${product_schema_1.tblSpecification.value}) = ${value}`);
        });
        baseCondition.push((0, drizzle_orm_1.and)(...specConditions));
    }
    if (min !== undefined && max !== undefined) {
        baseCondition.push((0, drizzle_orm_1.between)(product_schema_1.tblProductPriceTag.price, min, max));
    }
    else if (min !== undefined) {
        baseCondition.push((0, drizzle_orm_1.gte)(product_schema_1.tblProductPriceTag.price, min));
    }
    else if (max !== undefined) {
        baseCondition.push((0, drizzle_orm_1.lte)(product_schema_1.tblProductPriceTag.price, max));
    }
    const queryResult = db
        .select({
        id: product_schema_1.tblProducts.id,
        name: product_schema_1.tblProducts.name,
        image: product_schema_1.tblProducts.image,
        color: product_schema_1.tblProducts.color,
        rating: product_schema_1.tblProducts.rating,
        category: product_schema_1.tblCategories.categoryName,
        brand: product_schema_1.tblBrands.brandName,
        priceTagID: product_schema_1.tblProductPriceTag.id,
        price: product_schema_1.tblProductPriceTag.price,
        percent: product_schema_1.tblProductPriceTag.percent
    })
        .from(product_schema_1.tblProducts)
        .leftJoin(product_schema_1.tblCategories, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.categoryID, product_schema_1.tblCategories.id))
        .leftJoin(product_schema_1.tblBrands, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.brandID, product_schema_1.tblBrands.id))
        .leftJoin(product_schema_1.tblProductPriceTag, (0, drizzle_orm_1.eq)(product_schema_1.tblProductPriceTag.productID, product_schema_1.tblProducts.id))
        .leftJoin(product_schema_1.tblSpecification, (0, drizzle_orm_1.eq)(product_schema_1.tblSpecification.productID, product_schema_1.tblProducts.id))
        .where((0, drizzle_orm_1.and)(...baseCondition))
        .groupBy(product_schema_1.tblProducts.id, product_schema_1.tblProducts.name, product_schema_1.tblProducts.image, product_schema_1.tblProducts.color, product_schema_1.tblProducts.rating, product_schema_1.tblCategories.categoryName, product_schema_1.tblBrands.brandName, product_schema_1.tblProductPriceTag.price, product_schema_1.tblProductPriceTag.id)
        .limit(limit)
        .offset(offset);
    const result = (await queryResult).map((product) => ({
        id: product.id,
        name: product.name,
        image: product.image,
        color: product.color,
        rating: Number(product.rating),
        category: product.category,
        brand: product.brand,
        price: {
            id: product.priceTagID,
            productID: product.id,
            price: Number(product.price),
            percent: product.percent
        }
    }));
    return result;
};
exports.filteredbycategory = filteredbycategory;
const filteredFieldOptions = async (category) => {
    const db = (0, connection_1.getDbClient)();
    const queryResult = await db
        .select({
        key: product_schema_1.tblSpecification.key,
        value: product_schema_1.tblSpecification.value
    })
        .from(product_schema_1.tblSpecification)
        .innerJoin(product_schema_1.tblProducts, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.id, product_schema_1.tblSpecification.productID))
        .innerJoin(product_schema_1.tblCategories, (0, drizzle_orm_1.eq)(product_schema_1.tblCategories.id, product_schema_1.tblProducts.categoryID))
        .where((0, drizzle_orm_1.sql) `LOWER(${product_schema_1.tblCategories.categoryName}) = ${category}`)
        .groupBy(product_schema_1.tblSpecification.key, product_schema_1.tblSpecification.value);
    const result = {};
    queryResult.forEach((spec) => {
        const key = spec.key;
        const value = spec.value;
        if (!result[key]) {
            result[key] = [];
        }
        if (!result[key].includes(value)) {
            result[key].push(value);
        }
    });
    return result;
};
exports.filteredFieldOptions = filteredFieldOptions;
