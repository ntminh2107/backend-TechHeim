"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessTokenKey = process.env.ACCESS_TOKEN_KEY || '';
const refreshTokenKey = process.env.REFRESH_TOKEN_KEY || '';
const generateAccessToken = (userID, role) => {
    const payload = { userID, role };
    return jsonwebtoken_1.default.sign(payload, accessTokenKey, { expiresIn: '15m' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userID) => {
    return jsonwebtoken_1.default.sign({ userID }, refreshTokenKey, { expiresIn: '7d' });
};
exports.generateRefreshToken = generateRefreshToken;
