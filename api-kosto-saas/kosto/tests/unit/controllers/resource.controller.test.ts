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

    test('createResource debería validar campos requeridos', async () => {
        await expect(createResource('t1', {} as any))
            .rejects.toThrow('ValidationError: Missing required fields');
    });

    test('createResource debería insertar y retornar el recurso creado', async () => {
        const mockRow = { id: 'res1', name: 'Harina', unit_of_measure: 'kg', unit_cost: 1.5, current_stock: 0 };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const payload = { name: 'Harina', unit_of_measure: 'kg', unit_cost: 1.5 };
        const result = await createResource('t1', payload);

        expect(result).toEqual(mockRow);
        expect(mockClient.release).toHaveBeenCalled();
    });

    test('getResources debería retornar recursos activos ordenados', async () => {
        mockClient.query.mockResolvedValue({ rows: [{ name: 'A' }, { name: 'B' }] });

        const result = await getResources('t1');

        expect(result).toHaveLength(2);
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY name ASC'), ['t1']);
    });

    test('updateResource debería actualizar y retornar los datos', async () => {
        const mockRow = { id: 'res1', name: 'Harina', unit_of_measure: 'kg', unit_cost: 2.0 };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const result = await updateResource('t1', 'res1', { name: 'Harina', unit_of_measure: 'kg', unit_cost: 2.0 });

        expect(result.unit_cost).toBe(2.0);
    });

    test('forceDeleteResource debería lanzar error CONFLICT ante FK violation (23503)', async () => {
        const pgError: any = new Error('Foreign key violation');
        pgError.code = '23503';
        mockClient.query.mockRejectedValue(pgError);

        await expect(forceDeleteResource('t1', 'res1'))
            .rejects.toThrow('CONFLICT');
    });

    test('softDeleteResource debería retornar true si el update afecta una fila', async () => {
        mockClient.query.mockResolvedValue({ rowCount: 1 });

        const result = await softDeleteResource('t1', 'res1');

        expect(result).toBe(true);
    });
});