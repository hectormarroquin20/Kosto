import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getTenantFromHeader } from '@/utils/auth'; // Ajusta el path según donde lo guardes
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('getTenantFromHeader', () => {

    test('debería retornar el tenantId cuando la cabecera está en minúsculas', () => {
        const event = {
            headers: { 'x-tenant-id': 'tenant-123' }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBe('tenant-123');
    });

    test('debería retornar el tenantId cuando la cabecera tiene mayúsculas (CamelCase)', () => {
        const event = {
            headers: { 'X-Tenant-Id': 'tenant-456' }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBe('tenant-456');
    });

    test('debería retornar null cuando la cabecera no existe', () => {
        const event = {
            headers: { 'authorization': 'Bearer token' }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBeNull();
    });

    test('debería retornar null cuando el valor de la cabecera es null o undefined', () => {
        const event = {
            headers: { 'x-tenant-id': undefined }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBeNull();
    });
});