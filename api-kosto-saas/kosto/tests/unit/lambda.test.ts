import { beforeAll, describe, expect, jest, test } from '@jest/globals';
import { lambdaHandler } from '../../app';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { upsertRecipeItem } from '@/controllers/recipe.controller';

import { CognitoIdentityService } from '@/services/cognito-identity.service';
import { createTenant } from '@/controllers/tenant.controller';

// We mock the controllers to avoid interacting with the real database
jest.mock('@/controllers/product.controller');
jest.mock('@/controllers/recipe.controller');
jest.mock('@/controllers/tenant.controller');
jest.mock('@/controllers/resource.controller');
jest.mock('@/controllers/transaction.controller');
jest.mock('@/controllers/production.controller');
jest.mock('@/services/subscription.service', () => ({
    SubscriptionService: {
        checkLimits: jest.fn<any>().mockResolvedValue(true)
    }
}));
jest.mock('@/utils/auth', () => ({
    getTenantFromHeader: () => 'test-tenant-id'
}));
jest.mock('@/services/cognito-identity.service');

describe('LambdaHandler Integration Tests', () => {

    beforeAll(() => {
        jest.mocked(upsertRecipeItem).mockResolvedValue({
            id: 'recipe-123',
            product_id: 'p1',
            resource_id: 'r1',
            required_quantity: 10.5
        } as any);

    });

    const send = (method: string, path: string, body?: any, query?: any) => ({
        httpMethod: method,
        path,
        body: body ? JSON.stringify(body) : null,
        queryStringParameters: query || null,
        headers: { 'x-tenant-id': 'test-tenant-id' }
    } as any as APIGatewayProxyEvent);

    test('Resources: POST y DELETE', async () => {
        const payload = { name: 'Water', unit_cost: "1.0", unit_of_measure: "liters" };
        expect((await lambdaHandler(send('POST', '/resources', payload))).statusCode).toBe(201);
        expect((await lambdaHandler(send('DELETE', '/resources/force-delete', null, { id: '1' }))).statusCode).toBe(200);
    });

    test('Products: Full CRUD', async () => {
        expect((await lambdaHandler(send('POST', '/products', { name: 'Taco', sale_price: "5.0", is_pre_made: true }))).statusCode).toBe(201);
        expect((await lambdaHandler(send('PUT', '/products', { id: '1', name: 'Taco', sale_price: "6.0", is_pre_made: true }))).statusCode).toBe(200);
        expect((await lambdaHandler(send('DELETE', '/products', null, { id: '1' }))).statusCode).toBe(200);
    });

    test('Recipes: Validation of number conversion', async () => {
        const res = await lambdaHandler(send('POST', '/recipes', {
            product_id: 'p1', resource_id: 'r1', required_quantity: "10.5"
        }));
        expect(res.statusCode).toBe(201);
    });

    test('Tenants: Dynamic and static routes', async () => {
        jest.mocked(createTenant).mockResolvedValue({
            id: 'mock-tenant-123',
            company_name: 'Test'
        } as any);

        const cognitoSpy = jest.spyOn(CognitoIdentityService.prototype, 'createUser')
            .mockResolvedValue(undefined as any);

        const res = await lambdaHandler(send('POST', '/tenants', {
            company_name: 'Test',
            tier: 'pro',
            email: 'test@kosto.com',
            password: 'Password123!'
        }));
        expect(res.statusCode).toBe(201);

        cognitoSpy.mockRestore();
        (createTenant as jest.Mock).mockReset();
    });

    test('Production: Error capture (try/catch)', async () => {
        const res = await lambdaHandler(send('POST', '/production', { product_id: 'p1', quantity: 1 }));
        expect(res.statusCode).toBeLessThan(500);
    });

    test('Not found route', async () => {
        expect((await lambdaHandler(send('GET', '/nonexistent-route'))).statusCode).toBe(404);
    });
});

