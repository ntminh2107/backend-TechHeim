"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpError_1 = require("@/libs/HttpError");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const isDevelopment = process.env.NODE_ENV !== 'production';
const errorHandler = (err, _req, res, _next) => {
    const status = err instanceof HttpError_1.HttpError
        ? err.statusCode
        : httpStatusCode_1.default.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal server error';
    if (isDevelopment) {
        console.error(err);
    }
    else {
        console.error(message);
    }
    res.status(status).json({
        status,
        message,
        ...(isDevelopment ? { stack: err.stack } : {})
    });
};
exports.default = errorHandler;
