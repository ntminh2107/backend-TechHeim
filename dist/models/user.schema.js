"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tblAddress = exports.tblRole = exports.tblUser = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const pg_core_2 = require("drizzle-orm/pg-core");
exports.tblUser = (0, pg_core_2.pgTable)('users', {
    id: (0, pg_core_2.uuid)('id').primaryKey().defaultRandom(),
    fullName: (0, pg_core_2.varchar)('fullname', { length: 55 }).notNull(),
    email: (0, pg_core_2.varchar)('email', { length: 255 }).notNull(),
    password: (0, pg_core_2.text)('password').notNull(),
    phoneNumber: (0, pg_core_2.varchar)('phoneNumber', { length: 25 }),
    roleID: (0, pg_core_1.integer)('role_id')
        .references(() => exports.tblRole.id)
        .default(2),
    created_at: (0, pg_core_2.timestamp)('created_at').defaultNow().notNull(),
    updated_at: (0, pg_core_2.timestamp)('updated_at').defaultNow().notNull()
});
exports.tblRole = (0, pg_core_2.pgTable)('roles', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    role: (0, pg_core_2.varchar)('role', { length: 255 })
});
exports.tblAddress = (0, pg_core_2.pgTable)('addresses', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userID: (0, pg_core_2.varchar)('user_id', { length: 255 }),
    fullname: (0, pg_core_2.varchar)('fullname', { length: 255 }),
    address: (0, pg_core_2.varchar)('address', { length: 255 }),
    district: (0, pg_core_2.varchar)('district', { length: 255 }),
    city: (0, pg_core_2.varchar)('city', { length: 255 }),
    country: (0, pg_core_2.varchar)('country', { length: 255 })
});
