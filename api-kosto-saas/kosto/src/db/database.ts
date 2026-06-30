// src/db/database.ts
import { Pool } from 'pg';

export const dbPool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    max: 2, // Mantenemos el pool muy pequeño para Lambdas
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
});

// Listener útil para ver si la DB se desconecta en desarrollo
dbPool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});