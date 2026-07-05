import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import {
    createTenant,
    getTenant,
    updateTenant,
    forceDeleteTenant,
    softDeleteTenant
} from '@/controllers/tenant.controller';
import { dbPool } from '@/db/database';

jest.mock('@/db/database');

describe('Tenant Controller Unit Tests', () => {
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

    test('createTenant should insert and return the new tenant', async () => {
        const mockRow = { id: 't1', company_name: 'Kosto Corp', tier: 'freemium' };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const result = await createTenant('Kosto Corp', 'freemium');

        expect(result).toEqual(mockRow);
        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO tenant'),
            ['Kosto Corp', 'freemium']
        );
        expect(mockClient.release).toHaveBeenCalled();
    });

    test('getTenant should return a tenant by its ID', async () => {
        const mockRow = { id: 't1', company_name: 'Kosto Corp' };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const result = await getTenant('t1');

        expect(result).toEqual(mockRow);
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['t1']);
    });

    test('updateTenant should update the fields correctly', async () => {
        const mockRow = { id: 't1', company_name: 'Nuevo Nombre', tier: 'pro' };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const result = await updateTenant('t1', { company_name: 'Nuevo Nombre', tier: 'pro', is_active: true });

        expect(result.company_name).toBe('Nuevo Nombre');
        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE tenant'),
            ['Nuevo Nombre', 'pro', true, 't1']
        );
    });

    test('forceDeleteTenant should throw an error CONFLICT for FK violation (23503)', async () => {
        const pgError: any = new Error('Foreign key violation');
        pgError.code = '23503';
        mockClient.query.mockRejectedValue(pgError);

        await expect(forceDeleteTenant('t1'))
            .rejects.toThrow('CONFLICT');
    });

    test('softDeleteTenant should return true if the update was successful', async () => {
        mockClient.query.mockResolvedValue({ rowCount: 1 });

        const result = await softDeleteTenant('t1');

        expect(result).toBe(true);
        expect(mockClient.query).toHaveBeenCalledWith(
            expect.stringContaining('SET is_active = FALSE'),
            ['t1']
        );
    });
});