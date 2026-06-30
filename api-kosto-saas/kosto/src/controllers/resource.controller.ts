import { dbPool } from '../db/database';
import { CreateResourceDTO } from '../models/types';

export const createResource = async (tenantId: string, payload: Partial<CreateResourceDTO>) => {
    // 1. Validación básica de datos de entrada
    if (!payload.name || !payload.unit_of_measure || payload.unit_cost === undefined) {
        throw new Error('ValidationError: Missing required fields (name, unit_of_measure, unit_cost)');
    }

    // 2. Obtener una conexión del Pool
    const client = await dbPool.connect();
    
    try {
        // 3. Consulta parametrizada con RETURNING para devolver el registro creado
        const queryText = `
            INSERT INTO resource (tenant_id, name, unit_of_measure, unit_cost, current_stock)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, unit_of_measure, unit_cost, current_stock, created_at
        `;
        
        // Si no envían stock inicial, asumimos 0
        const initialStock = payload.current_stock || 0;
        const values = [tenantId, payload.name, payload.unit_of_measure, payload.unit_cost, initialStock];

        const result = await client.query(queryText, values);
        
        return result.rows[0];
    } finally {
        // 4. SIEMPRE liberar el cliente de vuelta al pool, incluso si hay error
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

export const updateResource = async (
    tenantId: string, 
    id: string, 
    name: string, 
    unitOfMeasure: string, 
    unitCost: number
) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE resource 
            SET name = $1, unit_of_measure = $2, unit_cost = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 AND tenant_id = $5
            RETURNING id, name, unit_of_measure, unit_cost, current_stock, updated_at;
        `;
        const result = await client.query(queryText, [name, unitOfMeasure, unitCost, id, tenantId]);
        return result.rows[0]; // Retorna el recurso modificado
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