"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tblTransaction = exports.tblOrderItems = exports.tblOrder = exports.tblCartItems = exports.tblCart = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const user_schema_1 = require("./user.schema");
const product_schema_1 = require("./product.schema");
exports.tblCart = (0, pg_core_1.pgTable)('carts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userID: (0, pg_core_1.uuid)('user_id').references(() => user_schema_1.tblUser.id),
    status: (0, pg_core_1.varchar)('status', { length: 255 }).default('cart')
});
exports.tblCartItems = (0, pg_core_1.pgTable)('cartItems', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    cartID: (0, pg_core_1.uuid)('cart_id').references(() => exports.tblCart.id),
    productID: (0, pg_core_1.integer)('product_id').references(() => product_schema_1.tblProducts.id),
    quantity: (0, pg_core_1.integer)('quantity').default(1),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 })
});
exports.tblOrder = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userID: (0, pg_core_1.uuid)('user_id').references(() => user_schema_1.tblUser.id),
    addressID: (0, pg_core_1.integer)('address_id'),
    status: (0, pg_core_1.varchar)('status', { length: 255 }).default('pending'),
    total: (0, pg_core_1.decimal)('total_price', { precision: 10, scale: 2 }).default('0.00'),
    hasPaid: (0, pg_core_1.decimal)('has_paid', { precision: 10, scale: 2 }).default('0.00'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull()
});
exports.tblOrderItems = (0, pg_core_1.pgTable)('orderItems', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    orderID: (0, pg_core_1.uuid)('order_id').references(() => exports.tblOrder.id),
    productID: (0, pg_core_1.integer)('product_id')
        .references(() => product_schema_1.tblProducts.id)
        .notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 })
});
exports.tblTransaction = (0, pg_core_1.pgTable)('transactions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    orderID: (0, pg_core_1.uuid)('order_id').references(() => exports.tblOrder.id),
    userID: (0, pg_core_1.uuid)('user_id').references(() => user_schema_1.tblUser.id),
    type: (0, pg_core_1.varchar)('type', { length: 255 }),
    deposit: (0, pg_core_1.decimal)('deposit', { precision: 10, scale: 2 }),
    status: (0, pg_core_1.varchar)('status', { length: 255 }).default('created'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at').defaultNow()
});
