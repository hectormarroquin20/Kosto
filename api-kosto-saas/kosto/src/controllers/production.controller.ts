import { dbPool } from '../db/database';
import { PoolClient } from 'pg';

export const processProduction = async (
    tenantId: string,
    productId: string,
    quantity: number,
    txClient?: PoolClient // <-- Optionally inject a transaction
) => {
    // If a client is provided, use it. Otherwise, get a new one from the pool.
    const client = txClient || await dbPool.connect();
    const isLocalTransaction = !txClient; // Flag to know who controls the COMMIT

    try {
        if (isLocalTransaction) await client.query('BEGIN');

        // 1. Get the product
        const productQuery = await client.query(
            'SELECT is_pre_made FROM product WHERE id = $1 AND tenant_id = $2',
            [productId, tenantId]
        );

        if (productQuery.rowCount === 0) throw new Error('Product not found');
        const isPreMade = productQuery.rows[0].is_pre_made;

        // 2. Get the recipe
        const recipe = await client.query(
            'SELECT resource_id, required_quantity FROM recipe_item WHERE product_id = $1',
            [productId]
        );

        // !NEW CRITICAL VALIDATION!
        if (recipe.rows.length === 0) {
            throw new Error('The product does not have a recipe defined. Cannot produce.');
        }

        // 3. Deduct resources
        for (const item of recipe.rows) {
            const totalNeeded = parseFloat(item.required_quantity) * quantity;

            // 1. FIRST: Find out how much stock we really have BEFORE trying to subtract
            const checkStock = await client.query(
                'SELECT current_stock, name FROM resource WHERE id = $1 AND tenant_id = $2',
                [item.resource_id, tenantId]
            );

            const currentStock = parseFloat(checkStock.rows[0]?.current_stock || '0');
            const resName = checkStock.rows[0]?.name || 'Unknown ingredient';

            console.log(`DEBUG: Ingredient: ${resName}, Current Stock: ${currentStock}, Needed: ${totalNeeded}`);

            // 2. SECOND: Validate BEFORE trying the update
            if (currentStock < totalNeeded) {
                throw new Error(`Insufficient stock for: ${resName}. You have ${currentStock}, need ${totalNeeded}.`);
            }

            // 3. THIRD: Execute the update (now we know there's enough stock)
            const updateRes = await client.query(
                `UPDATE resource SET current_stock = current_stock - $1 
         WHERE id = $2 AND tenant_id = $3`,
                [totalNeeded, item.resource_id, tenantId]
            );
        }

        // 4. Increase stock ONLY if it's pre-made (Cake)
        if (isPreMade) {
            const updateProduct = await client.query(
                `UPDATE product SET current_stock = current_stock + $1 
                 WHERE id = $2 AND tenant_id = $3`,
                [quantity, productId, tenantId]
            );

            if (updateProduct.rowCount === 0) throw new Error('Error updating product stock');
        }

        // 5. Log ALWAYS in production history (The traceability you saved)
        await client.query(
            `INSERT INTO production_batch (tenant_id, product_id, quantity_produced)
             VALUES ($1, $2, $3)`,
            [tenantId, productId, quantity]
        );

        if (isLocalTransaction) await client.query('COMMIT');

        return { success: true, is_pre_made: isPreMade };

    } catch (err) {
        if (isLocalTransaction) await client.query('ROLLBACK');
        throw err;
    } finally {
        if (isLocalTransaction) client.release();
    }
};