"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const HttpError_1 = require("@/libs/HttpError");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const authorize = (...allowedRole) => {
    return (req, _res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRole.includes(userRole)) {
            throw new HttpError_1.HttpError('Forbidden: you dont have any permission', httpStatusCode_1.default.NOT_ALLOWED);
        }
        next();
    };
};
exports.authorize = authorize;
