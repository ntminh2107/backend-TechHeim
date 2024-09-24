"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        next();
    }
    const extractedErrors = [];
    errors.array().forEach((err) => {
        if ('param' in err) {
            // Type guard to check if 'param' exists in 'err'
            extractedErrors.push({ [err.param]: err.msg });
        }
    });
    return res.status(422).json({
        errors: extractedErrors
    });
};
exports.default = validate;
