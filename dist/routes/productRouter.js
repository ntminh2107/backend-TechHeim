"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductRouter = void 0;
const product_controller_1 = require("@/controllers/product.controller");
const authentication_1 = __importDefault(require("@/middlewares/authentication"));
const authorization_1 = require("@/middlewares/authorization");
const wrapError_1 = __importDefault(require("@/utils/wrapError"));
const validators_1 = require("@/validators");
const express_1 = require("express");
const getProductRouter = () => {
    const router = (0, express_1.Router)();
    /* list of product by category or brand */
    router.get('/brand/:brand', (0, wrapError_1.default)(product_controller_1.listFilteredByBrand));
    router.get('/category/:category', (0, wrapError_1.default)(product_controller_1.filteredProduct));
    router.get('/spec/:category', (0, wrapError_1.default)(product_controller_1.specFilterCtrl));
    /* product detail */
    router.get('/detail/:id', (0, wrapError_1.default)(product_controller_1.getProductDetail));
    /*use authen for specific function */
    router.use(authentication_1.default);
    /* add a product */
    router.post('/add', (0, authorization_1.authorize)('admin'), (0, validators_1.productValidation)(), (0, wrapError_1.default)(product_controller_1.addProduct));
    return router;
};
exports.getProductRouter = getProductRouter;
