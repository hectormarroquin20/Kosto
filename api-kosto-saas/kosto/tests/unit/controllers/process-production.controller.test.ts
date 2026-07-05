import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { processProduction } from '@/controllers/production.controller';
import { dbPool } from '@/db/database';

// Mock the database pool
jest.mock('@/db/database');

describe('processProduction Controller', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            query: jest.fn<any>().mockResolvedValue({ rowCount: 1, rows: [] }), // Default safe value
            release: jest.fn()
        };
        (dbPool.connect as jest.Mock<any>).mockResolvedValue(mockClient);
    });

    test('should fail if there is not enough stock', async () => {
        // 1. BEGIN
        mockClient.query.mockResolvedValueOnce({});
        // 2. Product (is_pre_made: true)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] });
        // 3. Recipe (NOTE: we define required_quantity as string '2' as your code expects)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ resource_id: 'res1', required_quantity: '2' }] });
        // 4. Stock (Flour, we have 1, need 2*1 = 2)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ current_stock: '1', name: 'Flour' }] });

        // Execution
        await expect(processProduction('t1', 'p1', 1))
            .rejects.toThrow(/Insufficient stock for: Flour/);

        // Verify that ROLLBACK was called
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('should complete production successfully', async () => {
        mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // BEGIN
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] }); // Product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ resource_id: 'res1', required_quantity: '1' }] }); // Recipe
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ current_stock: '10', name: 'Flour' }] }); // Stock
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Update resource
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Update product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert history
        mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // COMMIT

        const result = await processProduction('t1', 'p1', 1);
        expect(result.success).toBe(true);
    });
});