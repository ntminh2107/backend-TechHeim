"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HttpError_1 = require("@/libs/HttpError");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authentication = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader?.startsWith('Bearer ')) {
        throw new HttpError_1.HttpError('Unauthorized', httpStatusCode_1.default.NOT_FOUND);
    }
    const token = authHeader.split(' ')[1];
    const isCustomAuth = token.length < 500;
    let decodedData;
    if (token && isCustomAuth) {
        decodedData = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_KEY);
        req.user = { id: decodedData.userID, role: decodedData.role };
    }
    return next();
};
exports.default = authentication;
