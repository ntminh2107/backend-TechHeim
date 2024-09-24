"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthRouter = void 0;
const auth_controller_1 = require("@/controllers/auth.controller");
const authentication_1 = __importDefault(require("@/middlewares/authentication"));
const authorization_1 = require("@/middlewares/authorization");
const httpStatusCode_1 = __importDefault(require("@/utils/httpStatusCode"));
const wrapError_1 = __importDefault(require("@/utils/wrapError"));
const validators_1 = require("@/validators");
const express_1 = require("express");
const getAuthRouter = () => {
    const router = (0, express_1.Router)();
    router.post('/register', (0, validators_1.registerValidation)(), (0, wrapError_1.default)(auth_controller_1.registerUser));
    router.post('/login', (0, validators_1.loginValidation)(), (0, wrapError_1.default)(auth_controller_1.login));
    router.use(authentication_1.default);
    router.get('/user/me', (0, wrapError_1.default)(auth_controller_1.getUser));
    router.get('/admin', (0, authorization_1.authorize)('admin'), (0, wrapError_1.default)((_req, res) => {
        res.status(httpStatusCode_1.default.ACCEPTED).json({ message: 'welcome admin' });
    }));
    router.get('/profile', (0, authorization_1.authorize)('admin', 'user'), (0, wrapError_1.default)((req, res) => {
        res
            .status(httpStatusCode_1.default.ACCEPTED)
            .json({ message: `welcome ${req.user?.role}` });
    }));
    router.post('/address/add', (0, wrapError_1.default)(auth_controller_1.addAddress));
    return router;
};
exports.getAuthRouter = getAuthRouter;
