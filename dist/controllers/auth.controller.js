"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddress = exports.getUser = exports.login = exports.registerUser = void 0;
const auth_service_1 = require("@/services/auth.service");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_service_1 = require("@/services/jwt.service");
const HttpError_1 = require("@/libs/HttpError");
const user_service_1 = require("@/services/user.service");
const registerUser = async (req, res) => {
    const { fullName, email, password, phoneNumber } = req.body;
    const data = await (0, auth_service_1.register)(fullName, email, password, phoneNumber);
    if (typeof data === 'string')
        throw new HttpError_1.HttpError('User is not created successfully: ' + data, httpStatusCode_1.default.BAD_REQUEST);
    res.status(httpStatusCode_1.default.CREATED).json({
        message: 'User created successfully',
        data
    });
};
exports.registerUser = registerUser;
const login = async (req, res) => {
    const data = await (0, auth_service_1.findUserByEmail)(req.body.email);
    if (!data) {
        throw new HttpError_1.HttpError("user doesn't exist, pls try again!!", httpStatusCode_1.default.NOT_FOUND);
    }
    const isCorrectPassword = await bcryptjs_1.default.compare(req.body.password, data.password);
    if (!isCorrectPassword) {
        throw new HttpError_1.HttpError('Password is not correct, pls try again!!', httpStatusCode_1.default.NOT_MATCH);
    }
    if (!data.id || !data.role) {
        throw new HttpError_1.HttpError('User information is incomplete, unable to login!', httpStatusCode_1.default.BAD_REQUEST);
    }
    const jwtToken = (0, jwt_service_1.generateAccessToken)(data.id, data.role);
    res.status(httpStatusCode_1.default.ACCEPTED).json({
        token: jwtToken
    });
};
exports.login = login;
const getUser = async (req, res) => {
    const userID = req.user?.id;
    if (!userID)
        throw new HttpError_1.HttpError('no user found with this ID', httpStatusCode_1.default.NOT_ALLOWED);
    const data = await (0, auth_service_1.findUserByID)(userID);
    res.status(httpStatusCode_1.default.OK).json({
        message: 'User information retrieve successfully',
        data: data
    });
};
exports.getUser = getUser;
const addAddress = async (req, res) => {
    const userID = req.user?.id;
    const { name, address, district, city, country } = req.body;
    if (!userID)
        throw new HttpError_1.HttpError('no user found with this ID', httpStatusCode_1.default.NOT_ALLOWED);
    const data = await (0, user_service_1.insertAddress)(userID, name, address, district, city, country);
    return res.status(httpStatusCode_1.default.CREATED).json({
        message: 'add address success',
        result: data
    });
};
exports.addAddress = addAddress;
