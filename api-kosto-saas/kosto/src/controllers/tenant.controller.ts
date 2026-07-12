import { dbPool } from '../db/database';
import { buildUpdateQuery } from '../utils/sql';
import { Tenant } from '../models/tenant.inteface';

const TENANT_UPDATABLE_COLUMNS = ['company_name', 'is_active'];
const VALID_TIERS = ['freemium', 'pro', 'business'];

export const createTenant = async (companyName: string, tier: string = 'freemium', admin_email: string) => {
    const client = await dbPool.connect();
    try {
        const safeTier = VALID_TIERS.includes(tier) ? tier : 'freemium';

        const queryText = `
            INSERT INTO tenant (company_name, tier, admin_email)
            VALUES ($1, $2, $3)
            ON CONFLICT (admin_email) DO NOTHING
            RETURNING id;
        `;
        const result = await client.query(queryText, [companyName, safeTier, admin_email]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const findTenantByEmail = async (email: string) => {
    const client = await dbPool.connect();
    try {
        const query = "SELECT id FROM tenant WHERE admin_email = $1 LIMIT 1";
        const result = await client.query(query, [email]);
        return result.rows[0] || null;
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

export const updateTenant = async (id: string, payload: Partial<Tenant>) => {
    const client = await dbPool.connect();
    try {
        const updatePayload: Partial<Tenant> = {};

        if (payload.company_name !== undefined) updatePayload.company_name = payload.company_name;
        if (payload.is_active !== undefined) updatePayload.is_active = payload.is_active;
        const { text, values } = buildUpdateQuery(
            'tenant',
            updatePayload as Record<string, unknown>,
            { id },
            'id, company_name, tier, updated_at',
            [],
            TENANT_UPDATABLE_COLUMNS
        );

        const result = await client.query(text, values);
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
        // If the error is a foreign key constraint violation (code 23503 in PostgreSQL)
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

// Add this function
export const upgradeTenantTier = async (id: string, newTier: 'freemium' | 'pro' | 'business') => {
    const client = await dbPool.connect();
    try {
        if (!VALID_TIERS.includes(newTier)) throw new Error('Invalid tier');

        const queryText = `
            UPDATE tenant
            SET tier = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, tier;
        `;
        const result = await client.query(queryText, [newTier, id]);
        return result.rows[0];
    } finally {
        client.release();
    }
};
