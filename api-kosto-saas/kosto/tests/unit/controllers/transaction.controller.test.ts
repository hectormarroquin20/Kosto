import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { registerSale } from '@/controllers/transaction.controller';
import { dbPool } from '@/db/database';
import { processProduction } from '@/controllers/production.controller';

jest.mock('@/db/database');
jest.mock('@/controllers/production.controller');

describe('Sale Controller Unit Tests', () => {
    let mockClient: any;

    beforeEach(() => {
        // 1. Creamos el cliente mock que tendrá el método query
        mockClient = {
            query: jest.fn(),
            release: jest.fn()
        };

        // 2. Mockeamos el método 'connect' del pool para que devuelva nuestro mockClient
        (dbPool.connect as jest.Mock<any>).mockResolvedValue(mockClient);

        // 3. Opcional: Mockeamos el método 'query' del pool directamente si el código lo usa
        (dbPool.query as jest.Mock<any>) = mockClient.query;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('registerSale debería manejar venta de producto pre-fabricado (Pastel)', async () => {
        // 1. Mock para el BEGIN
        mockClient.query.mockResolvedValueOnce({});

        // 2. Mock para el SELECT product (ahora este sí recibe la respuesta correcta)
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] });

        // 3. Mock para el UPDATE product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 });

        // 4. Mock para el INSERT transaction_log
        mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'tx1' }] });

        // 5. Mock para el COMMIT
        mockClient.query.mockResolvedValueOnce({});

        const result = await registerSale('t1', 'p1', 1, 50.0);

        expect(result.id).toBe('tx1');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    test('registerSale debería llamar a processProduction con el mismo cliente (Café)', async () => {
        // 1. Mock BEGIN
        mockClient.query.mockResolvedValueOnce({});

        // 2. Mock SELECT product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: false }] });

        // 3. Mockeamos la respuesta de processProduction para que no intente hacer queries reales
        (processProduction as jest.Mock<any>).mockResolvedValue({ success: true });

        // 4. Mock INSERT transaction_log
        mockClient.query.mockResolvedValueOnce({ rows: [{ id: 'tx1', transaction_date: new Date() }] });

        // 5. Mock COMMIT
        mockClient.query.mockResolvedValueOnce({});

        const result = await registerSale('t1', 'p1', 1, 10.0);

        // Verificaciones
        expect(processProduction).toHaveBeenCalledWith('t1', 'p1', 1, mockClient);
        expect(result.id).toBe('tx1');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    test('registerSale debería hacer ROLLBACK si algo falla en la venta', async () => {
        // Simular error al insertar el log
        mockClient.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ is_pre_made: true }] }); // Select product
        mockClient.query.mockResolvedValueOnce({ rowCount: 1 }); // Update product
        mockClient.query.mockRejectedValueOnce(new Error('DB Error')); // Error en log

        await expect(registerSale('t1', 'p1', 1, 50.0)).rejects.toThrow('DB Error');

        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();
    });
});