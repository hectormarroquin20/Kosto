import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { buildResponse } from '@/utils/response';

describe('buildResponse', () => {

    test('should return the correct status and headers', () => {
        const response = buildResponse(200, { message: 'OK' });

        expect(response.statusCode).toBe(200);
        expect(response.headers['Content-Type']).toBe('application/json');
        expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    test('should convert a single object into an array in the data property', () => {
        const body = { data: { id: 1, name: 'Product' } };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        expect(Array.isArray(parsedBody.data)).toBe(true);
        expect(parsedBody.data).toHaveLength(1);
        expect(parsedBody.data[0].id).toBe(1);
    });

    test('should keep an existing array in the data property', () => {
        const body = { data: [{ id: 1 }, { id: 2 }] };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        expect(parsedBody.data).toHaveLength(2);
    });

    test('should convert null/undefined in the data to an empty array', () => {
        const body = { data: null };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        expect(parsedBody.data).toEqual([]);
    });

    test('should ignore normalization if the data property does not exist', () => {
        const body = { message: 'No data here' };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        // 1. Verify that data does not exist
        expect(parsedBody.data).toBeUndefined();
        // 2. Verify that the message is correct
        expect(parsedBody.message).toBe('No data here');
    });
});