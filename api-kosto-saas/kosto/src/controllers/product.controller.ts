import { dbPool } from '../db/database';

// Crear un nuevo producto
export const createProduct = async (
    tenantId: string,
    name: string,
    salePrice: number,
    isPreMade: boolean = false,
    isActive: boolean = true
) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            INSERT INTO product (tenant_id, name, sale_price, is_pre_made, is_active)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, tenant_id, name, sale_price, current_stock, is_pre_made, created_at;
        `;
        const result = await client.query(queryText, [tenantId, name, salePrice, isPreMade, isActive]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

// Obtener todos los productos del tenant
export const getProducts = async (tenantId: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            SELECT id, name, sale_price, current_stock, is_pre_made, is_active, created_at
            FROM product
            WHERE tenant_id = $1 AND is_active = TRUE
            ORDER BY name ASC;
        `;
        const result = await client.query(queryText, [tenantId]);
        return result.rows;
    } finally {
        client.release();
    }
};

export const updateProduct = async (
    tenantId: string,
    id: string,
    name: string,
    salePrice: number,
    isPreMade: boolean,
    isActive: boolean = true
) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE product 
            SET name = $1, sale_price = $2, is_pre_made = $3, is_active= $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 AND tenant_id = $6
            RETURNING id, name, sale_price, current_stock, is_pre_made, updated_at;
        `;
        const result = await client.query(queryText, [name, salePrice, isPreMade, isActive, id, tenantId]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const forceDeleteProduct = async (tenantId: string, id: string) => {
    const client = await dbPool.connect();
    try {
        // Intentamos el borrado físico
        const result = await client.query(
            'DELETE FROM product WHERE id = $1 AND tenant_id = $2',
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

export const softDeleteProduct = async (tenantId: string, id: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE product 
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