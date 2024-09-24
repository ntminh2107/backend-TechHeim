"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartRouter = void 0;
const cart_controller_1 = require("@/controllers/cart.controller");
const authentication_1 = __importDefault(require("@/middlewares/authentication"));
const express_1 = require("express");
const wrapError_1 = __importDefault(require("@/utils/wrapError"));
const validators_1 = require("@/validators");
const getCartRouter = () => {
    const router = (0, express_1.Router)();
    router.use(authentication_1.default);
    router.post('/add', (0, validators_1.addToCartValidation)(), (0, wrapError_1.default)(cart_controller_1.addToCartCtrl));
    router.get('/me', (0, wrapError_1.default)(cart_controller_1.getCart));
    router.post('/update', (0, validators_1.updateQuantityValidation)(), (0, wrapError_1.default)(cart_controller_1.updateQuantityItm));
    router.delete('/delete/all', (0, validators_1.deleteCartItemValidation)(), (0, wrapError_1.default)(cart_controller_1.deleteCart));
    router.delete('/delete', (0, wrapError_1.default)(cart_controller_1.deleteCartItem));
    return router;
};
exports.getCartRouter = getCartRouter;
