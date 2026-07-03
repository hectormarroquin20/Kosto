// src/db/database.ts
import { Pool, types } from 'pg';

// 1. Números (lo que ya pusimos)
types.setTypeParser(1700, (val) => parseFloat(val));
types.setTypeParser(20, (val) => parseInt(val, 10));

// 2. Fechas (Configuración global)
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
    max: 2, // Mantenemos el pool muy pequeño para Lambdas
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000
});

// Listener útil para ver si la DB se desconecta en desarrollo
dbPool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});