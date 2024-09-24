"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAddress = void 0;
const connection_1 = require("@/database/connection");
const user_schema_1 = require("@/models/user.schema");
const drizzle_orm_1 = require("drizzle-orm");
const insertAddress = async (userID, fullname, address, district, city, country) => {
    const db = (0, connection_1.getDbClient)();
    return await db.transaction(async (trx) => {
        const checkUser = await trx
            .select({ id: user_schema_1.tblUser.id })
            .from(user_schema_1.tblUser)
            .where((0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, userID))
            .limit(1)
            .then((rows) => rows[0]);
        if (!checkUser)
            throw new Error('can not found user, pls try again');
        const [resAddress] = await trx
            .insert(user_schema_1.tblAddress)
            .values({
            userID,
            fullname,
            address,
            district,
            city,
            country
        })
            .returning();
        if (!resAddress)
            throw new Error('something wrong happen');
        return resAddress;
    });
};
exports.insertAddress = insertAddress;
