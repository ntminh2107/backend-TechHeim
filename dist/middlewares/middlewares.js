"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const applyMiddlewares = () => {
    return [passport_1.default.initialize(), express_1.default.json(), (0, cors_1.default)()];
};
exports.default = applyMiddlewares;
