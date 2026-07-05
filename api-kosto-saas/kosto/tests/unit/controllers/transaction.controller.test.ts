import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { registerSale } from '@/controllers/transaction.controller';
import { dbPool } from '@/db/database';
import { processProduction } from '@/controllers/production.controller';

jest.mock('@/db/database');
jest.mock('@/controllers/production.controller');

describe('Sales Controller Unit Tests', () => {
    let mockClient: any;

    beforeEach(() => {
        // 1. Create the mock client that will have the query method
        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };

        // 2. Mock the 'connect' method of the pool to return our mockClient
        (dbPool.connect as jest.Mock<any>).mockResolvedValue(mockClient);

        // 3. Optionally, mock the 'query' method of the pool directly if the code uses it
        (dbPool.query as jest.Mock<any>) = mockClient.query;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('registerSale should handle pre-fabricated product sale (Cake)', async () => {
        // 1. Mock for BEGIN
        mockClient.query.mockResolvedValueOnce({});

        // 2. Mock for the SELECT product (now this one will return the correct response)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] });

        // 3. Mock for the UPDATE product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

        // 4. Mock for the INSERT transaction_log
        mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'tx1' }] });

        // 5. Mock for COMMIT
        mockClient.query.mockResolvedValueOnce({});

        const result = await registerSale('t1', 'p1', 1, 50.0);

        expect(result.id).toBe('tx1');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    test('registerSale should call processProduction with the same client (Coffee)', async () => {
        // 1. Mock BEGIN
        mockClient.query.mockResolvedValueOnce({});

        // 2. Mock SELECT product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: false }] });

        // 3. Mock the response of processProduction to avoid real queries
        (processProduction as jest.Mock<any>).mockResolvedValue({ success: true });

        // 4. Mock INSERT transaction_log
        mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'tx1', transaction_date: new Date() }] });

        // 5. Mock COMMIT
        mockClient.query.mockResolvedValueOnce({});

        const result = await registerSale('t1', 'p1', 1, 10.0);

        // Verifications
        expect(processProduction).toHaveBeenCalledWith('t1', 'p1', 1, mockClient);
        expect(result.id).toBe('tx1');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    test('registerSale should do ROLLBACK if something goes wrong in the sale', async () => {
        // Simulate error while inserting the log
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] }); // Select product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Update product
        mockClient.query.mockRejectedValueOnce(new Error('DB Error')); // DB error during log

        await expect(registerSale('t1', 'p1', 1, 50.0)).rejects.toThrow('DB Error');

        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();
    });
});