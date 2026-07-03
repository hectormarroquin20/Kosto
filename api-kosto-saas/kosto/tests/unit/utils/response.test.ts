import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { buildResponse } from '@/utils/response';

describe('buildResponse', () => {

    test('debería retornar el status y los headers correctos', () => {
        const response = buildResponse(200, { message: 'OK' });

        expect(response.statusCode).toBe(200);
        expect(response.headers['Content-Type']).toBe('application/json');
        expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    test('debería convertir un objeto único en un array en la propiedad data', () => {
        const body = { data: { id: 1, name: 'Producto' } };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        expect(Array.isArray(parsedBody.data)).toBe(true);
        expect(parsedBody.data).toHaveLength(1);
        expect(parsedBody.data[0].id).toBe(1);
    });

    test('debería mantener un array existente en la propiedad data', () => {
        const body = { data: [{ id: 1 }, { id: 2 }] };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        expect(parsedBody.data).toHaveLength(2);
    });

    test('debería convertir null/undefined en data a un array vacío', () => {
        const body = { data: null };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        expect(parsedBody.data).toEqual([]);
    });

    test('debería ignorar la normalización si no existe la propiedad data', () => {
        const body = { message: 'No hay data aquí' };
        const response = buildResponse(200, body);
        const parsedBody = JSON.parse(response.body);

        // 1. Verificamos que data no exista
        expect(parsedBody.data).toBeUndefined();
        // 2. Verificamos que el mensaje sea el correcto
        expect(parsedBody.message).toBe('No hay data aquí');
    });
});