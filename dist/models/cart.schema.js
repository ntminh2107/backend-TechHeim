"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tblTransaction = exports.tblOrderItems = exports.tblOrder = exports.tblCartItems = exports.tblCart = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_schema_1 = require("./user.schema");
const product_schema_1 = require("./product.schema");
exports.tblCart = (0, pg_core_1.pgTable)('carts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userID: (0, pg_core_1.uuid)('userID').references(() => user_schema_1.tblUser.id),
    status: (0, pg_core_1.varchar)('status', { length: 255 }).default('cart')
});
exports.tblCartItems = (0, pg_core_1.pgTable)('cartItems', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    cartID: (0, pg_core_1.uuid)('cartID').references(() => exports.tblCart.id),
    productID: (0, pg_core_1.integer)('productID').references(() => product_schema_1.tblProducts.id),
    quantity: (0, pg_core_1.integer)('quantity').default(1),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 })
});
exports.tblOrder = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userID: (0, pg_core_1.uuid)('userID').references(() => user_schema_1.tblUser.id),
    addressID: (0, pg_core_1.integer)('addressID'),
    status: (0, pg_core_1.varchar)('status', { length: 255 }).default('pending'),
    total: (0, pg_core_1.decimal)('totalPrice', { precision: 10, scale: 2 }).default('0.00'),
    hasPaid: (0, pg_core_1.decimal)('hasPaid', { precision: 10, scale: 2 }).default('0.00'),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow().notNull()
});
exports.tblOrderItems = (0, pg_core_1.pgTable)('orderItems', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    orderID: (0, pg_core_1.uuid)('orderID').references(() => exports.tblOrder.id),
    productID: (0, pg_core_1.integer)('productID')
        .references(() => product_schema_1.tblProducts.id)
        .notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 })
});
exports.tblTransaction = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orderID: (0, pg_core_1.uuid)('orderID').references(() => exports.tblOrder.id),
    userID: (0, pg_core_1.uuid)('userID').references(() => user_schema_1.tblUser.id),
    type: (0, pg_core_1.varchar)('type', { length: 255 }),
    deposit: (0, pg_core_1.decimal)('deposit', { precision: 10, scale: 2 }),
    status: (0, pg_core_1.varchar)('status', { length: 255 }).default('created'),
    createdAt: (0, pg_core_1.timestamp)('createdAt').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt').defaultNow()
});
