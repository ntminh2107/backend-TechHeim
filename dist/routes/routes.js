"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRouter_1 = require("./authRouter");
const productRouter_1 = require("./productRouter");
const cartRouter_1 = require("./cartRouter");
const orderRouter_1 = require("./orderRouter");
const getRouter = () => {
    const router = (0, express_1.Router)();
    /* Router setup */
    router.use('/auth', (0, authRouter_1.getAuthRouter)());
    router.use('/product', (0, productRouter_1.getProductRouter)());
    router.use('/cart', (0, cartRouter_1.getCartRouter)());
    router.use('/order', (0, orderRouter_1.getOrderRouter)());
    return router;
};
exports.default = getRouter;
