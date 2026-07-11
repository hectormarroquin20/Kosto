// import { Pool, types } from 'pg';

// // 1. Numbers (what we already put in place)
// types.setTypeParser(1700, (val) => parseFloat(val));
// types.setTypeParser(20, (val) => parseInt(val, 10));


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


async function getOrInitializePool(): Promise<Pool> {
    if (!pool) {
        const response = await client.send(new GetSecretValueCommand({
            SecretId: "Kosto/DatabaseURL"
        }));

        if (!response.SecretString) throw new Error("Secret not found");

        pool = new Pool({
            connectionString: response.SecretString,
            ssl: { rejectUnauthorized: true },
            max: 2,
            connectionTimeoutMillis: 2000,
            idleTimeoutMillis: 30000,
        });
    }
    return pool;
}

export const dbPool = {
    connect: async () => {
        const p = await getOrInitializePool();
        return p.connect();
    },
    query: async (text: string, params?: any[]) => {
        const p = await getOrInitializePool();
        return p.query(text, params);
    }
};