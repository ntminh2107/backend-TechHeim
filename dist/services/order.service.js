"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTransaction = exports.getOrder = exports.insertOrder = void 0;
const connection_1 = require("@/database/connection");
const cart_schema_1 = require("@/models/cart.schema");
const order_schema_1 = require("@/models/order.schema");
const product_schema_1 = require("@/models/product.schema");
const user_schema_1 = require("@/models/user.schema");
const drizzle_orm_1 = require("drizzle-orm");
const insertOrder = async (userID, addressID) => {
    const db = (0, connection_1.getDbClient)();
    const checkCart = await db
        .select()
        .from(cart_schema_1.tblCart)
        .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCart.userID, userID))
        .limit(1)
        .then((rows) => rows[0]);
    if (!checkCart)
        throw new Error('something wrong happen');
    return await db.transaction(async (trx) => {
        const insertOrder = await trx
            .insert(order_schema_1.tblOrders)
            .values({ userID: userID, addressID })
            .returning();
        if (!insertOrder)
            throw new Error('something wrong happen');
        const orderID = insertOrder[0].id;
        const cartItemRs = await trx
            .select()
            .from(cart_schema_1.tblCartItems)
            .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, checkCart.id));
        if (cartItemRs.length === 0 || !cartItemRs)
            throw new Error('dont have any items in your cart!!! pls choose an item before going to order');
        let totalOrder = 0;
        const orderItems = cartItemRs.map((item) => {
            const total = Number(item.price) * item.quantity;
            totalOrder += total;
            return {
                orderID,
                productID: item.productID,
                quantity: item.quantity,
                price: total.toString()
            };
        });
        await trx.insert(cart_schema_1.tblOrderItems).values(orderItems).returning();
        await trx
            .update(order_schema_1.tblOrders)
            .set({ total: totalOrder.toString() })
            .where((0, drizzle_orm_1.eq)(cart_schema_1.tblOrder.id, orderID));
        return 'create new order success';
    });
};
exports.insertOrder = insertOrder;
/*TODO: GET order + do transaction w/ noti */
const getOrder = async (userID, orderID) => {
    const db = (0, connection_1.getDbClient)();
    const orderRs = await db
        .select()
        .from(order_schema_1.tblOrders)
        .leftJoin(user_schema_1.tblUser, (0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, cart_schema_1.tblOrder.userID))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, userID), (0, drizzle_orm_1.eq)(cart_schema_1.tblOrder.id, orderID)))
        .limit(1)
        .then((rows) => rows[0]);
    if (!orderRs)
        throw new Error('no order found!!!');
    const addressRs = await db
        .select({
        id: user_schema_1.tblAddress.id,
        fullname: user_schema_1.tblAddress.fullname,
        address: user_schema_1.tblAddress.address,
        city: user_schema_1.tblAddress.city,
        country: user_schema_1.tblAddress.country
    })
        .from(user_schema_1.tblAddress)
        .where((0, drizzle_orm_1.eq)(user_schema_1.tblAddress.id, orderRs.orders.addressID))
        .limit(1)
        .then((rows) => rows[0]);
    const orderItemsRs = await db
        .select({
        id: cart_schema_1.tblOrderItems.id,
        name: product_schema_1.tblProducts.name,
        image: product_schema_1.tblProducts.image,
        quantity: cart_schema_1.tblOrderItems.quantity,
        price: cart_schema_1.tblOrderItems.price
    })
        .from(cart_schema_1.tblOrderItems)
        .leftJoin(product_schema_1.tblProducts, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.id, cart_schema_1.tblOrderItems.productID))
        .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, orderRs.orders.id));
    const orderItemsObj = orderItemsRs.map((item) => ({
        ...item,
        price: Number(item.price)
    }));
    const result = {
        id: orderRs.orders.id,
        userID: orderRs.orders.userID,
        address: addressRs,
        status: orderRs.orders.status,
        orderItems: orderItemsObj,
        total: Number(orderRs.orders.total),
        createdAt: orderRs.orders.createdAt,
        updatedAt: orderRs.orders.updatedAt
    };
    return result;
};
exports.getOrder = getOrder;
const insertTransaction = async (userID, orderID, type, deposit) => {
    const db = (0, connection_1.getDbClient)();
    const [checkUserAndOrder] = await db
        .select({
        userID: user_schema_1.tblUser.id,
        orderID: cart_schema_1.tblOrder.id
    })
        .from(user_schema_1.tblUser)
        .innerJoin(cart_schema_1.tblOrder, (0, drizzle_orm_1.eq)(cart_schema_1.tblOrder.userID, user_schema_1.tblUser.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, userID), (0, drizzle_orm_1.eq)(cart_schema_1.tblOrder.id, orderID)))
        .limit(1);
    if (!checkUserAndOrder)
        throw new Error('no user found');
    return await db.transaction(async (trx) => {
        const insertRs = await trx
            .insert(cart_schema_1.tblTransaction)
            .values({
            orderID,
            userID,
            type,
            deposit: deposit.toString(),
            status: 'complete'
        })
            .returning();
        const transactionRs = {
            id: insertRs[0].id,
            orderID: insertRs[0].orderID,
            type: insertRs[0].type,
            deposit: Number(insertRs[0].deposit),
            status: insertRs[0].status,
            createdAt: insertRs[0].createdAt,
            updatedAt: insertRs[0].updatedAt
        };
        return transactionRs;
    });
};
exports.insertTransaction = insertTransaction;
