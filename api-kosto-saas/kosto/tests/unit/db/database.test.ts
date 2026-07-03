import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { dbPool } from '@/db/database';
import { types } from 'pg';

describe('Database Configuration', () => {

    test('debería tener configurados los parsers de tipos correctamente', () => {
        // Obtenemos el parser configurado para el tipo 1700 (Numeric)
        const numericParser = types.getTypeParser(1700);
        // Probamos que el parser convierta el string de DB a number
        expect(numericParser('123.45')).toBe(123.45);

        // Probamos el parser de fechas (Type 1082: DATE)
        const dateParser = types.getTypeParser(1082);
        const dateResult = dateParser('2026-07-02');
        expect(dateResult).toBeInstanceOf(Date);
        expect(dateResult.getFullYear()).toBe(2026);
    });

    test('dbPool debería tener la configuración correcta', () => {
        // Accedemos a la configuración interna del pool
        const config = (dbPool as any).options;

        expect(config.max).toBe(2);
        expect(config.port).toBe(5432);
        expect(config.idleTimeoutMillis).toBe(10000);
    });
});
