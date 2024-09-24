"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionValidation = exports.orderValidation = exports.updateQuantityValidation = exports.addToCartValidation = exports.deleteCartItemValidation = exports.productValidation = exports.registerValidation = exports.loginValidation = void 0;
const express_validator_1 = require("express-validator");
const loginValidation = () => {
    return [
        (0, express_validator_1.body)('email')
            .isEmail()
            .withMessage('Email is not in valid type')
            .trim()
            .escape(),
        (0, express_validator_1.body)('password')
            .isLength({ min: 8 })
            .withMessage('password at least 8 character')
            .trim()
            .escape()
    ];
};
exports.loginValidation = loginValidation;
const registerValidation = () => {
    return [
        (0, express_validator_1.body)('email').isEmail().withMessage('Email is not in valid type'),
        (0, express_validator_1.body)('password')
            .isLength({ min: 8 })
            .withMessage('Password should have at least: eigth characters, one upper case character, one lower case character and one number.')
            .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minSymbols: 0,
            minNumbers: 1,
            minUppercase: 1
        })
    ];
};
exports.registerValidation = registerValidation;
const productValidation = () => {
    return [
        (0, express_validator_1.body)('name')
            .exists()
            .withMessage('product name must be required')
            .isString()
            .withMessage('product name is not valid'),
        (0, express_validator_1.body)('image')
            .exists()
            .withMessage('product image must be required')
            .isString()
            .withMessage('product image is not valid'),
        (0, express_validator_1.body)('color')
            .exists()
            .withMessage('product color must be required')
            .isString()
            .withMessage('product color is not valid'),
        (0, express_validator_1.body)('category')
            .exists()
            .withMessage('product category must be required')
            .isString()
            .withMessage('product category is not valid'),
        (0, express_validator_1.body)('brand')
            .exists()
            .withMessage('product brand must be required')
            .isString()
            .withMessage('product brand is not valid'),
        (0, express_validator_1.body)('price').isFloat().withMessage('Price is not valid number'),
        (0, express_validator_1.body)('salePrice').isFloat().withMessage('sale price is not valid number'),
        (0, express_validator_1.body)('discount').isBoolean().withMessage('Discount must be true or false')
    ];
};
exports.productValidation = productValidation;
const deleteCartItemValidation = () => {
    return [(0, express_validator_1.body)('productID').exists().withMessage('productId must be required')];
};
exports.deleteCartItemValidation = deleteCartItemValidation;
const addToCartValidation = () => {
    return [(0, express_validator_1.body)('productID').exists().withMessage('productId must be required')];
};
exports.addToCartValidation = addToCartValidation;
const updateQuantityValidation = () => {
    return [
        (0, express_validator_1.body)('productID').exists().withMessage('productId must be required'),
        (0, express_validator_1.body)('quantity')
            .exists()
            .withMessage('quantity must be required')
            .isInt()
            .withMessage('quantity must be a number')
    ];
};
exports.updateQuantityValidation = updateQuantityValidation;
const orderValidation = () => {
    return [(0, express_validator_1.body)('addressID').exists().withMessage('addressID must be required')];
};
exports.orderValidation = orderValidation;
const transactionValidation = () => {
    return [
        (0, express_validator_1.body)('orderID').exists().withMessage('orderID must be required'),
        (0, express_validator_1.body)('type')
            .exists()
            .withMessage('type must be required')
            .isIn(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'])
            .withMessage('type does contain invalid value'),
        (0, express_validator_1.body)('deposit')
            .exists()
            .withMessage('deposit value must be required')
            .isFloat()
            .withMessage('deposit value must be a valid number')
    ];
};
exports.transactionValidation = transactionValidation;
