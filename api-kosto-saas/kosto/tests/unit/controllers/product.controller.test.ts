// Kosto-monorepo/api-kosto-saas/kosto/tests/unit/controllers/product.controller.test.ts (1-165)
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
    createProduct,
    getProducts,
    updateProduct,
    forceDeleteProduct,
    softDeleteProduct
} from '@/controllers/product.controller';
import { dbPool } from '@/db/database';

// 1. Mock the database pool module
jest.mock('@/db/database', () => ({
    dbPool: {
        connect: jest.fn(),
    },
}));

describe('Product Controller Unit Tests', () => {
    let mockQuery: jest.Mock<any>;
    let mockRelease: jest.Mock<any>;

    beforeEach(() => {
        // Clear previous mock calls before each test
        jest.clearAllMocks();

        // 2. Setup the client methods that dbPool.connect() will return
        mockQuery = jest.fn();
        mockRelease = jest.fn();

        const mockClient = {
            query: mockQuery,
            release: mockRelease,
        } as any;

        const mockConnect = dbPool.connect as unknown as jest.MockedFunction<() => Promise<any>>;
        mockConnect.mockResolvedValue(mockClient);
    });

    describe('createProduct', () => {
        test('should create a product and return the inserted row', async () => {
            const mockRow = { id: '1', name: 'Coffee', sale_price: 2.5 };
            mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

            const result = await createProduct('tenant-1', { name: 'Coffee', sale_price: 2.5, is_pre_made: true, is_active: true });

            expect(dbPool.connect).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['tenant-1', 'Coffee', 2.5, true, true, 0]);
            expect(result).toEqual(mockRow);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        test('should release the client even if the query fails', async () => {
            mockQuery.mockRejectedValueOnce(new Error('DB Error'));

            await expect(createProduct('tenant-1', { name: 'Coffee', sale_price: 2.5, is_pre_made: false })).rejects.toThrow('DB Error');
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('getProducts', () => {
        test('should return all active products when isPreMade is undefined', async () => {
            const mockRows = [{ id: '1', name: 'Coffee' }];
            mockQuery.mockResolvedValueOnce({ rows: mockRows });

            const result = await getProducts('tenant-1');

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('WHERE tenant_id = $1 AND is_active = TRUE'),
                ['tenant-1']
            );
            expect(result).toEqual(mockRows);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        test('should append is_pre_made condition when isPreMade is provided', async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] });

            await getProducts('tenant-1', false);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('AND is_pre_made = $2'),
                ['tenant-1', false]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('updateProduct', () => {
        test('should update a product and return the updated row', async () => {
            const mockRow = { id: '1', name: 'Updated Coffee' };
            mockQuery.mockResolvedValueOnce({ rows: [mockRow] });

            const result = await updateProduct('tenant-1', '1', { name: 'Updated Coffee', sale_price: 3.0, is_pre_made: false, is_active: true });

            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ['Updated Coffee', 3.0, false, true, '1', 'tenant-1']
            );
            expect(result).toEqual(mockRow);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('forceDeleteProduct', () => {
        test('should return true if physical deletion was successful', async () => {
            mockQuery.mockResolvedValueOnce({ rowCount: 1 });

            const result = await forceDeleteProduct('tenant-1', '1');

            expect(mockQuery).toHaveBeenCalledWith(
                'DELETE FROM product WHERE id = $1 AND tenant_id = $2',
                ['1', 'tenant-1']
            );
            expect(result).toBe(true);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        test('should return false if no rows were deleted', async () => {
            mockQuery.mockResolvedValueOnce({ rowCount: 0 });

            const result = await forceDeleteProduct('tenant-1', '99');

            expect(result).toBe(false);
        });

        test('should throw CONFLICT error if Postgres foreign key constraint fails (23503)', async () => {
            // Simulate Postgres foreign key violation error
            const fkError = new Error('Constraint violation') as any;
            fkError.code = '23503';
            mockQuery.mockRejectedValueOnce(fkError);

            await expect(forceDeleteProduct('tenant-1', '1')).rejects.toThrow('CONFLICT');
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        test('should throw normal error for other database failures', async () => {
            const genericError = new Error('Generic failure');
            mockQuery.mockRejectedValueOnce(genericError);

            await expect(forceDeleteProduct('tenant-1', '1')).rejects.toThrow('Generic failure');
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('softDeleteProduct', () => {
        test('should return true if update was successful', async () => {
            mockQuery.mockResolvedValueOnce({ rowCount: 1 });

            const result = await softDeleteProduct('tenant-1', '1');

            expect(mockQuery).toHaveBeenCalledWith(expect.any(String), ['1', 'tenant-1']);
            expect(result).toBe(true);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        test('should return false if product to soft-delete was not found', async () => {
            mockQuery.mockResolvedValueOnce({ rowCount: null }); // Simulate null rowCount fallback

            const result = await softDeleteProduct('tenant-1', '1');

            expect(result).toBe(false);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });
});