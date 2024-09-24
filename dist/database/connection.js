"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionToDB = exports.getDbClient = void 0;
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
//TODO: dot env trong app.tsx
let dbClient = null;
const getDbClient = () => {
    if (dbClient === null)
        throw new Error('DB client is not initialized');
    return dbClient;
};
exports.getDbClient = getDbClient;
const connectionToDB = async () => {
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
        dbClient = (0, node_postgres_1.drizzle)(client);
    }
    catch (err) {
        console.error('cannot connect to db');
    }
};
exports.connectionToDB = connectionToDB;
