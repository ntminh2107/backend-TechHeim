"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (req, res, next) => {
    res.status(404);
    const error = new Error(`this ${req.originalUrl} can not found`);
    next(error);
};
exports.default = notFound;
