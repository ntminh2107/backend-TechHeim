"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationDB = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
dotenv_1.default.config();
const migrationDB = async () => {
    try {
        const client = new pg_1.Client({
            host: process.env.POSTGRES_HOST || '',
            port: 5432,
            user: process.env.POSTGRES_USERNAME || '',
            password: process.env.POSTGRES_PASSWORD || '',
            database: process.env.POSTGRES_DB || ''
        });
        await client.connect();
        console.log('connect to db success');
        const db = (0, node_postgres_1.drizzle)(client);
        await (0, migrator_1.migrate)(db, { migrationsFolder: 'drizzle' });
        await client.end();
    }
    catch (err) {
        console.error('cannot connect to db');
    }
};
exports.migrationDB = migrationDB;
(0, exports.migrationDB)();
