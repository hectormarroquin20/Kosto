import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { getTenantFromHeader } from '@/utils/auth'; // Adjust the path according to where you save it
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('getTenantFromHeader', () => {

    test('should return the tenantId when the header is in lowercase', () => {
        const event = {
            headers: { 'x-tenant-id': 'tenant-123' }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBe('tenant-123');
    });

    test('should return the tenantId when the header has uppercase (CamelCase)', () => {
        const event = {
            headers: { 'X-Tenant-Id': 'tenant-456' }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBe('tenant-456');
    });

    test('should return null when the header does not exist', () => {
        const event = {
            headers: { 'authorization': 'Bearer token' }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBeNull();
    });

    test('should return null when the value of the header is null or undefined', () => {
        const event = {
            headers: { 'x-tenant-id': undefined }
        } as unknown as APIGatewayProxyEvent;

        expect(getTenantFromHeader(event)).toBeNull();
    });
});