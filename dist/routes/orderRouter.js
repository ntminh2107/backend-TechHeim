"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderRouter = void 0;
const order_controller_1 = require("@/controllers/order.controller");
const authentication_1 = __importDefault(require("@/middlewares/authentication"));
const wrapError_1 = __importDefault(require("@/utils/wrapError"));
const validators_1 = require("@/validators");
const express_1 = require("express");
const getOrderRouter = () => {
    const router = (0, express_1.Router)();
    router.use(authentication_1.default);
    router.post('/add', (0, validators_1.orderValidation)(), (0, wrapError_1.default)(order_controller_1.addAnOrder));
    router.get('/:orderID', (0, wrapError_1.default)(order_controller_1.getAnOrder));
    return router;
};
exports.getOrderRouter = getOrderRouter;
