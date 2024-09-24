"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const connection_1 = require("./database/connection");
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const routes_1 = __importDefault(require("./routes/routes"));
const httpStatusCode_1 = __importDefault(require("./utils/httpStatusCode"));
const middlewares_1 = __importDefault(require("./middlewares/middlewares"));
const app = (0, express_1.default)();
const start = async () => {
    app.use((0, middlewares_1.default)());
    /*Health check */
    app.get('/healthcheck', (_, res) => res.sendStatus(httpStatusCode_1.default.ACCEPTED).json({ message: 'healthy' }));
    app.use('/api', (0, routes_1.default)());
    app.use(errorHandler_1.default);
    app.listen(process.env.ENV_PORT, () => {
        console.log(`server is running on ${process.env.ENV_PORT}`);
    });
};
Promise.all([(0, connection_1.connectionToDB)()]).then(async () => await start());
