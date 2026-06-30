import { dbPool } from '../db/database';
import { PoolClient } from 'pg';

export const processProduction = async (
    tenantId: string, 
    productId: string, 
    quantity: number, 
    txClient?: PoolClient // <-- Inyectamos la transacción opcionalmente
) => {
    // Si viene un cliente, lo usamos. Si no, sacamos uno nuevo del pool.
    const client = txClient || await dbPool.connect();
    const isLocalTransaction = !txClient; // Bandera para saber quién controla el COMMIT
    
    try {
        if (isLocalTransaction) await client.query('BEGIN');

        // 1. Obtener el producto
        const productQuery = await client.query(
            'SELECT is_pre_made FROM product WHERE id = $1 AND tenant_id = $2',
            [productId, tenantId]
        );

        if (productQuery.rowCount === 0) throw new Error('Product not found');
        const isPreMade = productQuery.rows[0].is_pre_made;

        // 2. Obtener receta
        const recipe = await client.query(
            'SELECT resource_id, required_quantity FROM recipe_item WHERE product_id = $1',
            [productId]
        );

        // 3. Descontar recursos
        for (const item of recipe.rows) {
            const totalNeeded = item.required_quantity * quantity;
            const updateRes = await client.query(
                `UPDATE resource SET current_stock = current_stock - $1 
                 WHERE id = $2 AND tenant_id = $3 AND current_stock >= $1`,
                [totalNeeded, item.resource_id, tenantId]
            );

            if (updateRes.rowCount === 0) {
                throw new Error(`Insufficient stock for resource ${item.resource_id}`);
            }
        }

        // 4. Aumentar stock SOLO si es pre-fabricado (Pastel)
        if (isPreMade) {
            const updateProduct = await client.query(
                `UPDATE product SET current_stock = current_stock + $1 
                 WHERE id = $2 AND tenant_id = $3`,
                [quantity, productId, tenantId]
            );
            
            if (updateProduct.rowCount === 0) throw new Error('Error updating product stock');
        }

        // 5. Registrar SIEMPRE en historial de producción (La trazabilidad que salvaste)
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