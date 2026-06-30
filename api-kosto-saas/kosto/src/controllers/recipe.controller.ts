import { dbPool } from '../db/database';

export const addRecipeItem = async (tenantId: string, productId: string, resourceId: string, quantity: number) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            INSERT INTO recipe_item (product_id, resource_id, required_quantity, tenant_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, product_id, resource_id, required_quantity
        `;
        const result = await client.query(queryText, [productId, resourceId, quantity, tenantId]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const getRecipeItem = async (tenantId: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            SELECT *
            FROM recipe_item
            WHERE tenant_id = $1 AND is_active = TRUE
            ORDER BY id ASC;
        `;
        const result = await client.query(queryText, [tenantId]);
        return result.rows;
    } finally {
        client.release();
    }
};

export const updateRecipeItem = async (
    tenantId: string,
    id: string,
    productId: string,
    resourceId: string,
    quantity: number
) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE recipe_item 
            SET product_id = $1, resource_id = $2, required_quantity = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 AND tenant_id = $5
            RETURNING id, product_id, resource_id, required_quantity;
        `;
        const result = await client.query(queryText, [productId, resourceId, quantity, id, tenantId]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const forceDeleteRecipeItem = async (tenantId: string, id: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            DELETE FROM recipe_item 
            WHERE id = $1 AND tenant_id = $2
            RETURNING id;
        `;
        const result = await client.query(queryText, [id, tenantId]);
        return (result.rowCount ?? 0) > 0;
    } finally {
        client.release();
    }
};

export const softDeleteRecipeItem = async (tenantId: string, id: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `
            UPDATE recipe_item 
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