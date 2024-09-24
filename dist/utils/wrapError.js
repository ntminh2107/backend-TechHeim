"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrap = (callback) => {
    return async (req, res, next) => {
        try {
            await callback(req, res, next);
        }
        catch (error) {
            console.error(error);
            next(error);
        }
    };
};
exports.default = wrap;
