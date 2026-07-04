import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { upsertRecipeItem, getRecipeItem, updateRecipeItem, forceDeleteRecipeItem } from '@/controllers/recipe.controller';
import { dbPool } from '@/db/database';

jest.mock('@/db/database');

describe('Recipe Controller Unit Tests', () => {
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

    test('addRecipeItem debería insertar y retornar la fila', async () => {
        const mockRow = { id: '1', product_id: 'p1', resource_id: 'r1', required_quantity: 5 };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const result = await upsertRecipeItem('t1', 'p1', 'r1', 5);

        expect(result).toEqual(mockRow);
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO recipe_item'), expect.any(Array));
        expect(mockClient.release).toHaveBeenCalled();
    });

    test('getRecipeItem debería retornar todas las recetas activas', async () => {
        const mockRows = [{ id: '1' }, { id: '2' }];
        mockClient.query.mockResolvedValue({ rows: mockRows });

        const result = await getRecipeItem('t1');

        expect(result).toHaveLength(2);
        expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('WHERE tenant_id = $1'), ['t1']);
        expect(mockClient.release).toHaveBeenCalled();
    });

    test('updateRecipeItem debería retornar la fila actualizada', async () => {
        const mockRow = { id: '1', product_id: 'p1', resource_id: 'r1', required_quantity: 10 };
        mockClient.query.mockResolvedValue({ rows: [mockRow] });

        const result = await updateRecipeItem('t1', '1', 'p1', 'r1', 10);

        expect(result.required_quantity).toBe(10);
        expect(mockClient.release).toHaveBeenCalled();
    });

    test('forceDeleteRecipeItem debería retornar true si se eliminó algo', async () => {
        mockClient.query.mockResolvedValue({ rowCount: 1 });

        const result = await forceDeleteRecipeItem('t1', '1');

        expect(result).toBe(true);
        expect(mockClient.release).toHaveBeenCalled();
    });
});