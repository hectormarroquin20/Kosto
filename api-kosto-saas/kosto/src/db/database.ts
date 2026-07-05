// src/db/database.ts
import { Pool, types } from 'pg';

// 1. Numbers (what we already put in place)
types.setTypeParser(1700, (val) => parseFloat(val));
types.setTypeParser(20, (val) => parseInt(val, 10));

// 2. Dates (global configuration)
const parseDate = (val: string) => new Date(val);
types.setTypeParser(1082, parseDate); // DATE
types.setTypeParser(1114, parseDate); // TIMESTAMP
types.setTypeParser(1184, parseDate); // TIMESTAMPTZ

export const dbPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    max: 2, // Keep the pool very small for Lambdas
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
});

// Useful listener to see if the DB disconnects in development
dbPool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});