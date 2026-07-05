import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { dbPool } from '@/db/database';
import { types } from 'pg';

describe('Database Configuration', () => {

    test('should have the type parsers configured correctly', () => {
        // Get the parser configured for type 1700 (Numeric)
        const numericParser = types.getTypeParser(1700);
        // Test that the parser converts a string from the DB to a number
        expect(numericParser('123.45')).toBe(123.45);

        // Test the date parser (Type 1082: DATE)
        const dateParser = types.getTypeParser(1082);
        const dateResult = dateParser('2026-07-02');
        expect(dateResult).toBeInstanceOf(Date);
        expect(dateResult.getFullYear()).toBe(2026);
    });

    test('dbPool should have the correct configuration', () => {
        // Access the internal configuration of the pool
        const config = (dbPool as any).options;

        expect(config.max).toBe(2);
        expect(config.port).toBe(5432);
        expect(config.idleTimeoutMillis).toBe(10000);
    });
});
