"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
class HttpError extends Error {
    isHttpError;
    statusCode;
    constructor(message = 'Internal Server Error', status = 500) {
        super(message);
        this.isHttpError = true;
        this.statusCode = status;
    }
}
exports.HttpError = HttpError;
