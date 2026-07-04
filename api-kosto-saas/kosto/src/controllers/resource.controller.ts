import { dbPool } from '../db/database';
import { buildInsertQuery, buildUpdateQuery } from '../utils/sql';
import { CreateResourceDTO } from '../models/types';
import { Resource } from '../models/resource.interface';

const RESOURCE_INSERTABLE_COLUMNS = ['name', 'unit_of_measure', 'unit_cost', 'current_stock', 'is_active'];
const RESOURCE_UPDATABLE_COLUMNS = ['name', 'unit_of_measure', 'unit_cost', 'current_stock', 'is_active'];

export const createResource = async (tenantId: string, payload: Partial<CreateResourceDTO>) => {
    if (!payload.name || !payload.unit_of_measure || payload.unit_cost === undefined || payload.unit_cost === null) {
        throw new Error('ValidationError: Missing required fields (name, unit_of_measure, unit_cost)');
    }

    const client = await dbPool.connect();

    try {
        const insertPayload = {
            name: payload.name,
            unit_of_measure: payload.unit_of_measure,
            unit_cost: Number(payload.unit_cost),
            current_stock: payload.current_stock ?? 0,
            is_active: payload.is_active ?? true,
        };

        const { text, values } = buildInsertQuery(
            'resource',
            { tenant_id: tenantId },
            insertPayload,
            'id, name, unit_of_measure, unit_cost, current_stock, is_active, created_at',
            [],
            RESOURCE_INSERTABLE_COLUMNS
        );

        const result = await client.query(text, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const getResources = async (tenantId: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `SELECT * 
                            FROM resource 
                            WHERE tenant_id = $1 AND is_active = TRUE
                            ORDER BY name ASC;`;
        const result = await client.query(queryText, [tenantId]);
        return result.rows;
    } finally {
        client.release();
    }
};

export const updateResource = async (tenantId: string, id: string, payload: Partial<Resource>) => {
    const client = await dbPool.connect();
    try {
        const updatePayload: Partial<Resource> = {};

        if (payload.name !== undefined) updatePayload.name = payload.name;
        if (payload.unit_of_measure !== undefined) updatePayload.unit_of_measure = payload.unit_of_measure;
        if (payload.unit_cost !== undefined && payload.unit_cost !== null) updatePayload.unit_cost = Number(payload.unit_cost);
        if (payload.current_stock !== undefined && payload.current_stock !== null) updatePayload.current_stock = Number(payload.current_stock);
        if (payload.is_active !== undefined) updatePayload.is_active = payload.is_active;

        const { text, values } = buildUpdateQuery(
            'resource',
            updatePayload as Record<string, unknown>,
            { id, tenant_id: tenantId },
            'id, name, unit_of_measure, unit_cost, current_stock, updated_at',
            [],
            RESOURCE_UPDATABLE_COLUMNS
        );

        const result = await client.query(text, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const forceDeleteResource = async (tenantId: string, id: string) => {
    const client = await dbPool.connect();
    try {
        // Intentamos el borrado físico
        const result = await client.query(
            'DELETE FROM resource WHERE id = $1 AND tenant_id = $2',
            [id, tenantId]
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

export const softDeleteResource = async (tenantId: string, id: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE resource 
            SET is_active = FALSE 
            WHERE id = $1 AND tenant_id = $2
            RETURNING id;
        `;
        const result = await client.query(queryText, [id, tenantId]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};