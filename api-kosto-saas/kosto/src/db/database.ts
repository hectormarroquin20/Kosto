// import { Pool, types } from 'pg';
// import * as dotenv from 'dotenv';

// // 1. Numbers (what we already put in place)
// types.setTypeParser(1700, (val) => parseFloat(val));
// types.setTypeParser(20, (val) => parseInt(val, 10));

// dotenv.config();

// // 2. Dates (global configuration)
// const parseDate = (val: string) => new Date(val);
// types.setTypeParser(1082, parseDate); // DATE
// types.setTypeParser(1114, parseDate); // TIMESTAMP
// types.setTypeParser(1184, parseDate); // TIMESTAMPTZ

// export const dbPool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false },
//     max: 2, // Keep the pool very small for Lambdas
// });

// // Useful listener to see if the DB disconnects in development
// dbPool.on('error', (err, client) => {
//     console.error('Unexpected error on idle client', err);
// });

import { Pool, types } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

// Configuración de tipos
types.setTypeParser(1700, (val) => parseFloat(val));
types.setTypeParser(20, (val) => parseInt(val, 10));

const client = new SecretsManagerClient({ region: "us-east-1" });
let pool: Pool | null = null;

export const dbPool = {
    connect: async () => {
        if (!pool) {
            const response = await client.send(new GetSecretValueCommand({
                SecretId: "Kosto/DatabaseURL"
            }));
            pool = new Pool({
                connectionString: response.SecretString,
                ssl: { rejectUnauthorized: false },
                max: 2
            });
        }
        return pool.connect();
    },
    query: async (text: string, params?: any[]) => {
        if (!pool) {
            const response = await client.send(new GetSecretValueCommand({
                SecretId: "Kosto/DatabaseURL"
            }));
            pool = new Pool({
                connectionString: response.SecretString,
                ssl: { rejectUnauthorized: false },
                max: 2
            });
        }
        return pool.query(text, params);
    }
};