"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCart = exports.deleteCartItem = exports.updateQuantityItm = exports.getCart = exports.addToCartCtrl = void 0;
const HttpError_1 = require("@/libs/HttpError");
const cart_service_1 = require("@/services/cart.service");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const addToCartCtrl = async (req, res) => {
    const userID = req.user?.id;
    const { productID } = req.body;
    if (!productID)
        throw new HttpError_1.HttpError('product not found, pls try again!!!', httpStatusCode_1.default.NOT_ALLOWED);
    const data = await (0, cart_service_1.addToCart)(productID, userID);
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: 'add to cart success',
        data: data
    });
};
exports.addToCartCtrl = addToCartCtrl;
const getCart = async (req, res) => {
    const userID = req.user?.id;
    const data = await (0, cart_service_1.getCartUser)(userID);
    res
        .status(httpStatusCode_1.default.ACCEPTED)
        .json({ message: 'cart detail', data: data });
};
exports.getCart = getCart;
const updateQuantityItm = async (req, res) => {
    const userID = req.user?.id;
    const { productID, quantity } = req.body;
    if (!productID || !quantity) {
        throw new HttpError_1.HttpError('product or quantity is not valid!!!', httpStatusCode_1.default.NOT_FOUND);
    }
    const data = await (0, cart_service_1.updateQuantity)(userID, productID, quantity);
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: 'product quantity updated success',
        data: data
    });
};
exports.updateQuantityItm = updateQuantityItm;
const deleteCartItem = async (req, res) => {
    const userID = req.user?.id;
    const { productID } = req.body;
    if (!productID)
        throw new HttpError_1.HttpError('something wrong with this item, pls try again', httpStatusCode_1.default.NOT_ALLOWED);
    const data = await (0, cart_service_1.deleteItem)(userID, productID);
    res
        .status(httpStatusCode_1.default.ACCEPTED)
        .json({ message: 'items deleted success', data: data });
};
exports.deleteCartItem = deleteCartItem;
const deleteCart = async (req, res) => {
    const userID = req.user?.id;
    const data = await (0, cart_service_1.deleteAll)(userID);
    res
        .status(httpStatusCode_1.default.ACCEPTED)
        .json({ message: 'cart delete success', datas: data });
};
exports.deleteCart = deleteCart;
