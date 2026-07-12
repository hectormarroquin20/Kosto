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
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
    max: 2, // Keep the pool very small for Lambdas
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
});

// Useful listener to see if the DB disconnects in development
dbPool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});
