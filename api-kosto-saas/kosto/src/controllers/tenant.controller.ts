import { dbPool } from '../db/database';

export const createTenant = async (companyName: string, tier: string = 'freemium') => {
    const client = await dbPool.connect();
    try {
        // Validamos que el tier sea uno de los permitidos
        const validTiers = ['freemium', 'pro', 'business'];
        const safeTier = validTiers.includes(tier) ? tier : 'freemium';

        const queryText = `
            INSERT INTO tenant (company_name, tier)
            VALUES ($1, $2)
            RETURNING id, company_name, tier, created_at;
        `;
        const result = await client.query(queryText, [companyName, safeTier]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const getTenant = async (tenantId: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `SELECT * FROM tenant WHERE id = $1`;
        const result = await client.query(queryText, [tenantId]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const updateTenant = async (
    id: string,
    companyName: string,
    tier: string,
    isActive: boolean = true
) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE tenant 
            SET company_name = $1, tier = $2, is_active= $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, company_name, tier, updated_at;
        `;
        const result = await client.query(queryText, [companyName, tier, isActive, id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const forceDeleteTenant = async (id: string) => {
    const client = await dbPool.connect();
    try {
        // Intentamos el borrado físico
        const result = await client.query(
            'DELETE FROM tenant WHERE id = $1',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    } catch (err: any) {
        // Si el error es de restricción de llave foránea (código 23503 en Postgres)
        if (err.code === '23503') {
            throw new Error('CONFLICT');
        }
        throw err;
    } finally {
        client.release();
    }
};

export const softDeleteTenant = async (id: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE tenant 
            SET is_active = FALSE 
            WHERE id = $1
            RETURNING id;
        `;
        const result = await client.query(queryText, [id]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};