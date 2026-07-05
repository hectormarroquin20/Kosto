import { dbPool } from '../db/database';
import { processProduction } from './production.controller'; // <-- Importing the SSOT

export const registerSale = async (tenantId: string, productId: string, quantity: number, totalAmount: number) => {
    const client = await dbPool.connect();

    try {
        await client.query('BEGIN'); // Starting the master transaction

        // 1. Verify the product type
        const productQuery = await client.query(
            'SELECT is_pre_made FROM product WHERE id = $1 AND tenant_id = $2',
            [productId, tenantId]
        );

        if (productQuery.rowCount === 0) throw new Error('Product not found');
        const isPreMade = productQuery.rows[0].is_pre_made;

        // 2. Business Logic
        if (isPreMade) {
            // CAKE: Only deduct from the display shelf (already produced before)
            const updateProduct = await client.query(
                `UPDATE product SET current_stock = current_stock - $1 
                 WHERE id = $2 AND tenant_id = $3 AND current_stock >= $1`,
                [quantity, productId, tenantId]
            );
            if (updateProduct.rowCount === 0) throw new Error('Insufficient product stock in display');
        } else {
            // COFFEE (Make to Order): Call the magic, passing our transaction
            await processProduction(tenantId, productId, quantity, client);
        }

        // 3. Register the financial transaction
        const logQuery = `
            INSERT INTO transaction_log (tenant_id, type, reference_id, quantity, total_amount)
            VALUES ($1, 'sale', $2, $3, $4)
            RETURNING id, transaction_date;
        `;
        const result = await client.query(logQuery, [tenantId, productId, quantity, totalAmount]);

        await client.query('COMMIT'); // Saving the sale and production at the same time
        return result.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const getTransaction = async (tenantId: string) => {
    const client = await dbPool.connect();
    try {
        const queryText = `SELECT * FROM transaction_log WHERE tenant_id = $1`;
        const result = await client.query(queryText, [tenantId]);
        return result.rows;
    } finally {
        client.release();
    }
};