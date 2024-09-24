"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByID = exports.findUserByEmail = exports.register = void 0;
const connection_1 = require("@/database/connection");
const user_schema_1 = require("@/models/user.schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const register = async (fullName, email, password, phoneNumber) => {
    const db = (0, connection_1.getDbClient)();
    const currentTime = new Date();
    const existedUser = await db
        .select()
        .from(user_schema_1.tblUser)
        .where((0, drizzle_orm_1.eq)(user_schema_1.tblUser.email, email))
        .limit(1);
    if (existedUser && existedUser.length > 0) {
        throw new Error('User is already existed, please try to use another email or username');
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    return await db.transaction(async (trx) => {
        const result = await trx
            .insert(user_schema_1.tblUser)
            .values({
            email,
            fullName,
            password: hashedPassword,
            phoneNumber,
            created_at: currentTime,
            updated_at: currentTime
        })
            .returning();
        if (result && result.length > 0) {
            console.log(`Register success with email: ${email}`);
            return result[0];
        }
        else {
            throw new Error('User registration failed, no user returned.');
        }
    });
};
exports.register = register;
const findUserByEmail = async (email) => {
    const db = (0, connection_1.getDbClient)();
    const user = await db
        .select({
        id: user_schema_1.tblUser.id,
        email: user_schema_1.tblUser.email,
        password: user_schema_1.tblUser.password,
        role: user_schema_1.tblRole.role
    })
        .from(user_schema_1.tblUser)
        .innerJoin(user_schema_1.tblRole, (0, drizzle_orm_1.eq)(user_schema_1.tblUser.roleID, user_schema_1.tblRole.id))
        .where((0, drizzle_orm_1.eq)(user_schema_1.tblUser.email, email))
        .limit(1)
        .then((rows) => rows[0]);
    if (!user)
        throw new Error('No user found');
    return user;
};
exports.findUserByEmail = findUserByEmail;
const findUserByID = async (userID) => {
    const db = (0, connection_1.getDbClient)();
    const user = await db
        .select({
        id: user_schema_1.tblUser.id,
        fullName: user_schema_1.tblUser.fullName,
        email: user_schema_1.tblUser.email,
        phoneNumber: user_schema_1.tblUser.phoneNumber,
        role: user_schema_1.tblRole.role,
        createdAt: user_schema_1.tblUser.created_at,
        updatedAt: user_schema_1.tblUser.updated_at
    })
        .from(user_schema_1.tblUser)
        .innerJoin(user_schema_1.tblRole, (0, drizzle_orm_1.eq)(user_schema_1.tblUser.roleID, user_schema_1.tblRole.id))
        .where((0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, userID))
        .limit(1)
        .then((rows) => rows[0]);
    if (!user)
        throw new Error('no user found');
    return user;
};
exports.findUserByID = findUserByID;
