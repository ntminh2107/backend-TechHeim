"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specFilterCtrl = exports.filteredProduct = exports.listFilteredByCategory = exports.listFilteredByBrand = exports.getProductDetail = exports.addProduct = void 0;
const HttpError_1 = require("@/libs/HttpError");
const product_service_1 = require("@/services/product.service");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const addProduct = async (req, res) => {
    const { name, image, price, color, category, brand, specifications, percent } = req.body;
    if (!name || !price || !category || !brand) {
        throw new HttpError_1.HttpError('This field must not be empty', httpStatusCode_1.default.NOT_FOUND);
    }
    const data = await (0, product_service_1.insertProduct)(name, image, price, color, category, brand, specifications, percent);
    res.status(httpStatusCode_1.default.CREATED).json({
        message: 'Product information add success!!!',
        data: data
    });
};
exports.addProduct = addProduct;
const getProductDetail = async (req, res) => {
    const productID = req.params.id;
    if (!productID)
        throw new HttpError_1.HttpError('something wents wrong!!! pls try again', httpStatusCode_1.default.NOT_FOUND);
    const data = await (0, product_service_1.productDetail)(Number(productID));
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: `product with ID: ${productID} found`,
        data: data
    });
};
exports.getProductDetail = getProductDetail;
const listFilteredByBrand = async (req, res) => {
    const brand = req.params.brand;
    if (!brand)
        throw new HttpError_1.HttpError('something wents wrong!!! pls try again', httpStatusCode_1.default.NOT_FOUND);
    const data = await (0, product_service_1.filteredbyBrand)(brand);
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: `list of product from brand : ${brand}`,
        data: data
    });
};
exports.listFilteredByBrand = listFilteredByBrand;
const listFilteredByCategory = async (req, res) => {
    const category = req.params.category;
    if (!category)
        throw new HttpError_1.HttpError('something wents wrong!!! pls try again', httpStatusCode_1.default.NOT_FOUND);
    const data = await (0, product_service_1.filteredbyBrand)(category);
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: `list of product from category : ${category}`,
        data: data
    });
};
exports.listFilteredByCategory = listFilteredByCategory;
const filteredProduct = async (req, res) => {
    const category = req.params.category;
    const queryParams = req.query;
    if (!category || !queryParams)
        throw new HttpError_1.HttpError('something wents wrong!!! pls try again', httpStatusCode_1.default.NOT_FOUND);
    const data = await (0, product_service_1.filteredbycategory)(category, queryParams);
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: 'product filter list :',
        data: data
    });
};
exports.filteredProduct = filteredProduct;
const specFilterCtrl = async (req, res) => {
    const category = req.params.category;
    if (!category)
        throw new HttpError_1.HttpError('something wents wrong!!! pls try again', httpStatusCode_1.default.NOT_FOUND);
    const data = await (0, product_service_1.filteredFieldOptions)(category);
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        message: 'Options for filtering by spec:',
        data: data
    });
};
exports.specFilterCtrl = specFilterCtrl;
