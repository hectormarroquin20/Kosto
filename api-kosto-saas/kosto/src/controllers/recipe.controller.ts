import { dbPool } from '../db/database';
import { buildUpdateQuery } from '../utils/sql';
import { RecipeItem } from '../models/recipe-item.interface';

const RECIPE_UPDATABLE_COLUMNS = ['product_id', 'resource_id', 'required_quantity', 'is_active'];

export const upsertRecipeItem = async (tenantId: string, payload: Partial<RecipeItem>) => {
    if (!payload.product_id || !payload.resource_id || payload.required_quantity === undefined || payload.required_quantity === null) {
        throw new Error('ValidationError: Missing required fields (product_id, resource_id, required_quantity)');
    }

    const client = await dbPool.connect();
    try {
        const queryText = `
            INSERT INTO recipe_item (product_id, resource_id, required_quantity, tenant_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (product_id, resource_id) 
                DO UPDATE SET 
                    required_quantity = EXCLUDED.required_quantity,
                    tenant_id = EXCLUDED.tenant_id
                RETURNING id, product_id, resource_id, required_quantity;
        `;
        const result = await client.query(queryText, [payload.product_id, payload.resource_id, Number(payload.required_quantity), tenantId]);
        return result.rows[0];
    } finally {
        client.release();
    }
};

export const getRecipeItem = async (tenantId: string, productId?: string) => {
    const client = await dbPool.connect();
    try {
        // Base query
        let queryText = `
            SELECT *
            FROM recipe_item
            WHERE tenant_id = $1 AND is_active = TRUE
        `;
        const params: any[] = [tenantId];

        // If productId is passed, we filter. Otherwise, return all (current behavior)
        if (productId) {
            queryText += ` AND product_id = $2`;
            params.push(productId);
        }

        queryText += ` ORDER BY id ASC;`;

        const result = await client.query(queryText, params);
        return result.rows;
    } finally {
        client.release();
    }
};

export const updateRecipeItem = async (tenantId: string, id: string, payload: Partial<RecipeItem>) => {
    const client = await dbPool.connect();
    try {
        const updatePayload: Partial<RecipeItem> = {};

        if (payload.product_id !== undefined) updatePayload.product_id = payload.product_id;
        if (payload.resource_id !== undefined) updatePayload.resource_id = payload.resource_id;
        if (payload.required_quantity !== undefined && payload.required_quantity !== null) updatePayload.required_quantity = Number(payload.required_quantity);
        if (payload.is_active !== undefined) updatePayload.is_active = payload.is_active;

        const { text, values } = buildUpdateQuery(
            'recipe_item',
            updatePayload as Record<string, unknown>,
            { id, tenant_id: tenantId },
            'id, product_id, resource_id, required_quantity, updated_at',
            [],
            RECIPE_UPDATABLE_COLUMNS
        );

        const result = await client.query(text, values);
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