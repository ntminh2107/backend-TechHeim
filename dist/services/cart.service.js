"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = exports.deleteItem = exports.updateQuantity = exports.getCartUser = exports.addToCart = void 0;
const connection_1 = require("@/database/connection");
const cart_schema_1 = require("@/models/cart.schema");
const product_schema_1 = require("@/models/product.schema");
const user_schema_1 = require("@/models/user.schema");
const drizzle_orm_1 = require("drizzle-orm");
/*TODO: revert all services into a transaction */
const addToCart = async (productID, userID) => {
    const db = (0, connection_1.getDbClient)();
    const checkCart = await db
        .select()
        .from(cart_schema_1.tblCart)
        .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCart.userID, userID))
        .limit(1)
        .then((rows) => rows[0]);
    if (!checkCart) {
        throw new Error('User not found');
    }
    return await db.transaction(async (trx) => {
        let cartID;
        if (!checkCart) {
            const [newCart] = await trx
                .insert(cart_schema_1.tblCart)
                .values({ userID })
                .returning({ id: cart_schema_1.tblCart.id });
            cartID = newCart.id;
        }
        else {
            cartID = checkCart.id;
        }
        const [priceAndItem] = await trx
            .select({
            price: product_schema_1.tblProductPriceTag.price,
            percent: product_schema_1.tblProductPriceTag.percent,
            cartItem: cart_schema_1.tblCartItems
        })
            .from(product_schema_1.tblProductPriceTag)
            .leftJoin(cart_schema_1.tblCartItems, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.productID, product_schema_1.tblProductPriceTag.productID), (0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, cartID)))
            .where((0, drizzle_orm_1.eq)(product_schema_1.tblProductPriceTag.productID, productID))
            .limit(1);
        if (!priceAndItem) {
            throw new Error('Product price not found');
        }
        const salePrice = (Number(priceAndItem.price) *
            (1 - priceAndItem.percent / 100))
            .toFixed(2)
            .toString();
        const productPrice = priceAndItem.percent ? salePrice : priceAndItem.price;
        if (!priceAndItem.cartItem) {
            await trx
                .insert(cart_schema_1.tblCartItems)
                .values({ productID, cartID, price: productPrice });
        }
        else {
            await trx
                .update(cart_schema_1.tblCartItems)
                .set({ quantity: priceAndItem.cartItem.quantity + 1 })
                .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.id, priceAndItem.cartItem.id));
        }
        return 'Item added to cart successfully';
    });
};
exports.addToCart = addToCart;
const getCartUser = async (userID) => {
    const db = (0, connection_1.getDbClient)();
    let cart;
    const cartRs = await db
        .select({
        id: cart_schema_1.tblCart.id,
        userID: user_schema_1.tblUser.id,
        status: cart_schema_1.tblCart.status
    })
        .from(cart_schema_1.tblCart)
        .innerJoin(user_schema_1.tblUser, (0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, cart_schema_1.tblCart.userID))
        .where((0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, userID))
        .limit(1)
        .then((rows) => rows[0]);
    if (!cartRs) {
        const newCart = await db
            .insert(cart_schema_1.tblCart)
            .values({ userID })
            .returning()
            .then((rows) => rows[0]);
        cart = newCart;
    }
    else {
        cart = cartRs;
    }
    const cartItemsRs = await db
        .select({
        id: cart_schema_1.tblCartItems.id,
        name: product_schema_1.tblProducts.name,
        image: product_schema_1.tblProducts.image,
        quantity: cart_schema_1.tblCartItems.quantity,
        price: cart_schema_1.tblCartItems.price
    })
        .from(cart_schema_1.tblCartItems)
        .leftJoin(product_schema_1.tblProducts, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.id, cart_schema_1.tblCartItems.productID))
        .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, cart.id));
    const itemsWithPriceAsNumber = cartItemsRs.map((item) => ({
        ...item,
        price: Number(item.price)
    }));
    const result = {
        id: cart.id,
        userID: cart.userID,
        status: cart.status,
        cartItems: itemsWithPriceAsNumber
    };
    return result;
};
exports.getCartUser = getCartUser;
const updateQuantity = async (userID, productID, quantity) => {
    const db = (0, connection_1.getDbClient)();
    const checkCart = await db
        .select({
        cartID: cart_schema_1.tblCart.id,
        id: cart_schema_1.tblCartItems.id,
        quantity: cart_schema_1.tblCartItems.quantity
    })
        .from(cart_schema_1.tblCart)
        .leftJoin(cart_schema_1.tblCartItems, (0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, cart_schema_1.tblCart.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(cart_schema_1.tblCart.userID, userID), (0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.productID, productID)))
        .limit(1)
        .then((rows) => rows[0]);
    if (!checkCart) {
        throw new Error('cart not found');
    }
    return await db.transaction(async (trx) => {
        if (quantity <= 0) {
            await trx
                .delete(cart_schema_1.tblCartItems)
                .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.id, checkCart.id));
        }
        else {
            await trx
                .update(cart_schema_1.tblCartItems)
                .set({ quantity: quantity })
                .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.id, checkCart.id));
        }
        const resultUpdated = await trx
            .select({
            id: cart_schema_1.tblCart.id,
            userID: cart_schema_1.tblCart.userID,
            status: cart_schema_1.tblCart.status
        })
            .from(cart_schema_1.tblCart)
            .innerJoin(user_schema_1.tblUser, (0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, cart_schema_1.tblCart.userID))
            .where((0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, userID))
            .limit(1)
            .then((rows) => rows[0]);
        const listItemsUpdated = await trx
            .select({
            id: cart_schema_1.tblCartItems.id,
            name: product_schema_1.tblProducts.name,
            image: product_schema_1.tblProducts.image,
            quantity: cart_schema_1.tblCartItems.quantity,
            price: cart_schema_1.tblCartItems.price
        })
            .from(cart_schema_1.tblCartItems)
            .innerJoin(product_schema_1.tblProducts, (0, drizzle_orm_1.eq)(product_schema_1.tblProducts.id, cart_schema_1.tblCartItems.productID))
            .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, resultUpdated.id));
        const itemsWithPriceAsNumber = listItemsUpdated.map((item) => ({
            ...item,
            price: Number(item.price)
        }));
        const result = {
            id: resultUpdated.id,
            userID: resultUpdated.userID,
            status: resultUpdated.status,
            cartItems: itemsWithPriceAsNumber
        };
        return result;
    });
};
exports.updateQuantity = updateQuantity;
const deleteItem = async (userID, productID) => {
    const db = (0, connection_1.getDbClient)();
    const checkCart = await db
        .select({
        cartID: cart_schema_1.tblCart.id,
        id: cart_schema_1.tblCartItems.id,
        quantity: cart_schema_1.tblCartItems.quantity
    })
        .from(cart_schema_1.tblCart)
        .leftJoin(cart_schema_1.tblCartItems, (0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, cart_schema_1.tblCart.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(cart_schema_1.tblCart.userID, userID), (0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.productID, productID)))
        .limit(1)
        .then((rows) => rows[0]);
    if (!checkCart) {
        throw new Error('cart item not found');
    }
    return await db.transaction(async (trx) => {
        await trx
            .delete(cart_schema_1.tblCartItems)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.productID, productID), (0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, checkCart.cartID)));
        return 'delete item cart success';
    });
};
exports.deleteItem = deleteItem;
const deleteAll = async (userID) => {
    const db = (0, connection_1.getDbClient)();
    const checkCart = await db
        .select({ cartID: cart_schema_1.tblCart.id })
        .from(cart_schema_1.tblCart)
        .innerJoin(user_schema_1.tblUser, (0, drizzle_orm_1.eq)(user_schema_1.tblUser.id, cart_schema_1.tblCart.userID))
        .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCart.userID, userID))
        .limit(1)
        .then((rows) => rows[0]);
    if (!checkCart)
        return 'cart not found';
    return await db.transaction(async (trx) => {
        //delete all items in cart
        await trx
            .delete(cart_schema_1.tblCartItems)
            .where((0, drizzle_orm_1.eq)(cart_schema_1.tblCartItems.cartID, checkCart.cartID));
        //delete cart for user
        await trx.delete(cart_schema_1.tblCart).where((0, drizzle_orm_1.eq)(cart_schema_1.tblCart.id, checkCart.cartID));
        return 'delete all items in cart success';
    });
};
exports.deleteAll = deleteAll;
