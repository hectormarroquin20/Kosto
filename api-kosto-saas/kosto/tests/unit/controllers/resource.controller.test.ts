import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
    createResource,
    getResources,
    updateResource,
    forceDeleteResource,
    softDeleteResource
} from '@/controllers/resource.controller';
import { dbPool } from '@/db/database';

jest.mock('@/db/database');

describe('Resource Controller Unit Tests', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };
        (dbPool.connect as jest.Mock<any>).mockResolvedValue(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('createResource should validate required fields', async () => {
        await expect(createResource('t1', {} as any))
            .rejects.toThrow('ValidationError: Missing required fields');
    });

    test('createResource should insert and return the created resource', async () => {
        const mockRow = { id: 'res1', name: 'Flour', unit_of_measure: 'kg', unit_cost: 1.5, current_stock: 0 };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const payload = { name: 'Flour', unit_of_measure: 'kg', unit_cost: 1.5 };
        const result = await createResource('t1', payload);

        expect(result).toEqual(mockRow);
        expect(mockClient.release).toHaveBeenCalled();
    });

    test('getResources should return active resources ordered by name', async () => {
        mockClient.query.mockResolvedValue({ rows: [{ name: 'A' }, { name: 'B' }] });

        const result = await getResources('t1');

        expect(result).toHaveLength(2);
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY name ASC'), ['t1']);
    });

    test('updateResource should update and return the updated data', async () => {
        const mockRow = { id: 'res1', name: 'Flour', unit_of_measure: 'kg', unit_cost: 2.0 };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const result = await updateResource('t1', 'res1', { name: 'Flour', unit_of_measure: 'kg', unit_cost: 2.0 });

        expect(result.unit_cost).toBe(2.0);
    });

    test('forceDeleteResource should throw CONFLICT error on foreign key violation (23503)', async () => {
        const pgError: any = new Error('Foreign key violation');
        pgError.code = '23503';
        mockClient.query.mockRejectedValue(pgError);

        await expect(forceDeleteResource('t1', 'res1'))
            .rejects.toThrow('CONFLICT');
    });

    test('softDeleteResource should return true if the update affects a row', async () => {
        mockClient.query.mockResolvedValue({ rowCount: 1 });

        const result = await softDeleteResource('t1', 'res1');

        expect(result).toBe(true);
    });
});