"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doTransaction = exports.addAnOrder = exports.getAnOrder = void 0;
const HttpError_1 = require("@/libs/HttpError");
const order_service_1 = require("@/services/order.service");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const addAnOrder = async (req, res) => {
    const userID = req.user?.id;
    const { addressID } = req.body;
    if (!addressID)
        throw new HttpError_1.HttpError('address not found', httpStatusCode_1.default.NOT_FOUND);
    const data = (0, order_service_1.insertOrder)(userID, addressID);
    return res.status(httpStatusCode_1.default.CREATED).json({
        message: 'created success!!!',
        data: data
    });
};
exports.addAnOrder = addAnOrder;
const getAnOrder = async (req, res) => {
    const userID = req.user?.id;
    const { orderID } = req.body;
    if (!orderID)
        throw new HttpError_1.HttpError('order not found!!', httpStatusCode_1.default.NOT_FOUND);
    const data = (0, order_service_1.getOrder)(userID, orderID);
    return res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: `get an order with id :${orderID} success!!!`,
        data: data
    });
};
exports.getAnOrder = getAnOrder;
const doTransaction = async (req, res) => {
    const userID = req.user?.id;
    const { orderID, type, deposit } = req.body;
    if (!orderID)
        throw new HttpError_1.HttpError('order not found', httpStatusCode_1.default.NOT_FOUND);
    const data = (0, order_service_1.insertTransaction)(userID, orderID, type, deposit);
    return res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: `transaction complete with order: ${orderID} success!!!`,
        data: data
    });
};
exports.doTransaction = doTransaction;
