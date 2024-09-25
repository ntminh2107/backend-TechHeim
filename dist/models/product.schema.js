"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tblProductPriceTag = exports.tblCommentProduct = exports.tblSpecification = exports.tblProducts = exports.tblBrands = exports.tblCategories = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_schema_1 = require("./user.schema");
const pg_core_2 = require("drizzle-orm/pg-core");
exports.tblCategories = (0, pg_core_1.pgTable)('categories', {
    id: (0, pg_core_1.serial)('id').primaryKey().unique(),
    categoryName: (0, pg_core_1.varchar)('name', { length: 255 })
});
exports.tblBrands = (0, pg_core_1.pgTable)('brands', {
    id: (0, pg_core_1.serial)('id').primaryKey().unique(),
    brandName: (0, pg_core_1.varchar)('name', { length: 255 })
});
exports.tblProducts = (0, pg_core_1.pgTable)('products', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    image: (0, pg_core_1.varchar)('image', { length: 255 }),
    color: (0, pg_core_1.varchar)('color', { length: 255 }).notNull(),
    rating: (0, pg_core_1.decimal)('rating', { precision: 10, scale: 2 }).default('0.00'),
    categoryID: (0, pg_core_1.serial)('categoryID')
        .references(() => exports.tblCategories.id)
        .notNull(),
    brandID: (0, pg_core_1.serial)('brandID').references(() => exports.tblBrands.id)
});
exports.tblSpecification = (0, pg_core_1.pgTable)('specifications', {
    id: (0, pg_core_1.serial)('id').primaryKey().unique(),
    productID: (0, pg_core_1.serial)('productID').references(() => exports.tblProducts.id),
    key: (0, pg_core_1.varchar)('key', { length: 255 }),
    value: (0, pg_core_1.varchar)('value', { length: 255 })
});
exports.tblCommentProduct = (0, pg_core_1.pgTable)('comments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    productID: (0, pg_core_1.serial)('productID').references(() => exports.tblProducts.id),
    userID: (0, pg_core_2.uuid)('userID').references(() => user_schema_1.tblUser.id),
    content: (0, pg_core_1.varchar)('content', { length: 255 }),
    date: (0, pg_core_1.timestamp)('date').defaultNow(),
    rating: (0, pg_core_1.decimal)('rating', { precision: 10, scale: 2 })
});
exports.tblProductPriceTag = (0, pg_core_1.pgTable)('productPriceTags', {
    id: (0, pg_core_1.serial)('id').primaryKey().unique(),
    productID: (0, pg_core_1.serial)('productID').references(() => exports.tblProducts.id),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }),
    percent: (0, pg_core_1.integer)('percent')
});
