import { beforeEach, describe, expect, jest, test } from '@jest/globals';

import { processProduction } from '@/controllers/production.controller';
import { dbPool } from '@/db/database';

// Mock del pool de base de datos
jest.mock('@/db/database');

describe('processProduction Controller', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            query: jest.fn<any>().mockResolvedValue({ rowCount: 1, rows: [] }), // Valor por defecto seguro
            release: jest.fn()
        };
        (dbPool.connect as jest.Mock<any>).mockResolvedValue(mockClient);
    });

    test('debería fallar si no hay stock suficiente', async () => {
        // 1. BEGIN
        mockClient.query.mockResolvedValueOnce({});
        // 2. Producto (is_pre_made: true)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] });
        // 3. Receta (OJO: aquí definimos required_quantity como string '2' tal como lo espera tu código)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ resource_id: 'res1', required_quantity: '2' }] });
        // 4. Stock (Harina, tenemos 1, necesitamos 2*1 = 2)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ current_stock: '1', name: 'Harina' }] });

        // Ejecución
        await expect(processProduction('t1', 'p1', 1))
            .rejects.toThrow(/Stock insuficiente para: Harina/);

        // Verificamos que se llamó al ROLLBACK
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    test('debería completar la producción exitosamente', async () => {
        mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // BEGIN
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] }); // Producto
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ resource_id: 'res1', required_quantity: '1' }] }); // Receta
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ current_stock: '10', name: 'Harina' }] }); // Stock
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Update recurso
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Update producto
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Insert historial
        mockClient.query.mockResolvedValueOnce({ rowCount: 0 }); // COMMIT

        const result = await processProduction('t1', 'p1', 1);
        expect(result.success).toBe(true);
    });
});