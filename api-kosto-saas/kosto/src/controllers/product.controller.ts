import { dbPool } from '../db/database';
import { buildInsertQuery, buildUpdateQuery } from '../utils/sql';
import { ProductModel } from '../models/product.interface';

const PRODUCT_INSERTABLE_COLUMNS = ['name', 'sale_price', 'current_stock', 'is_pre_made', 'is_active'];
const PRODUCT_UPDATABLE_COLUMNS = ['name', 'sale_price', 'current_stock', 'is_pre_made', 'is_active'];

export const createProduct = async (tenantId: string, payload: Partial<ProductModel>) => {
    const client = await dbPool.connect();
    try {
        if (!payload.name || payload.sale_price === undefined || payload.sale_price === null) {
            throw new Error('ValidationError: Missing required fields (name, sale_price)');
        }

        const insertPayload = {
            name: payload.name,
            sale_price: Number(payload.sale_price),
            is_pre_made: payload.is_pre_made ?? false,
            is_active: payload.is_active ?? true,
            current_stock: payload.current_stock ?? 0,
        };

        const { text, values } = buildInsertQuery(
            'product',
            { tenant_id: tenantId },
            insertPayload,
            'id, tenant_id, name, sale_price, current_stock, is_pre_made, is_active, created_at',
            [],
            PRODUCT_INSERTABLE_COLUMNS
        );

        const result = await client.query(text, values);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const getProducts = async (tenantId: string, isPreMade?: boolean) => {
    const client = await dbPool.connect();
    try {
        let queryText = `
            SELECT id, name, sale_price, current_stock, is_pre_made, is_active, created_at
            FROM product
            WHERE tenant_id = $1 AND is_active = TRUE
        `;

        const queryParams: any[] = [tenantId];

        if (isPreMade !== undefined) {
            queryParams.push(isPreMade);
            queryText += ` AND is_pre_made = $${queryParams.length}`;
        }

        queryText += ` ORDER BY name ASC;`;

        const result = await client.query(queryText, queryParams);
        return result.rows;
    } finally {
        client.release();
    }
};


export const updateProduct = async (tenantId: string, id: string, payload: Partial<ProductModel>) => {
    const client = await dbPool.connect();
    try {
        const updatePayload: Partial<ProductModel> = {};

        if (payload.name !== undefined) updatePayload.name = payload.name;
        if (payload.sale_price !== undefined && payload.sale_price !== null) updatePayload.sale_price = Number(payload.sale_price);
        if (payload.is_pre_made !== undefined) updatePayload.is_pre_made = payload.is_pre_made;
        if (payload.is_active !== undefined) updatePayload.is_active = payload.is_active;
        if (payload.current_stock !== undefined && payload.current_stock !== null) updatePayload.current_stock = Number(payload.current_stock);

        const { text, values } = buildUpdateQuery(
            'product',
            updatePayload as Record<string, unknown>,
            { id, tenant_id: tenantId },
            'id, name, sale_price, current_stock, is_pre_made, updated_at',
            [],
            PRODUCT_UPDATABLE_COLUMNS
        );

        const result = await client.query(text, values);
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
        // If the error is a foreign key constraint violation (code 23503 in Postgres)
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