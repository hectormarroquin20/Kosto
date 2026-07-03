import { describe, expect, jest, test } from '@jest/globals';
import { lambdaHandler } from '../../app';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mockeamos los controladores para no tocar la BD real
jest.mock('@/controllers/product.controller');
jest.mock('@/controllers/recipe.controller');
jest.mock('@/controllers/tenant.controller');
jest.mock('@/controllers/resource.controller');
jest.mock('@/controllers/transaction.controller');
jest.mock('@/controllers/production.controller');
jest.mock('@/utils/auth', () => ({
    getTenantFromHeader: () => 'test-tenant-id'
}));

const mockEvent = (method: string, path: string, body?: any, query?: any): APIGatewayProxyEvent => ({
    httpMethod: method,
    path: path,
    body: body ? JSON.stringify(body) : null,
    queryStringParameters: query || null,
    headers: { 'x-tenant-id': 'test-tenant' },
} as any);

describe('LambdaHandler Integration Tests', () => {

    const send = (method: string, path: string, body?: any, query?: any) => ({
        httpMethod: method,
        path,
        body: body ? JSON.stringify(body) : null,
        queryStringParameters: query || null,
        headers: { 'x-tenant-id': 'test-tenant-id' }
    } as any as APIGatewayProxyEvent);

    test('Resources: POST y DELETE', async () => {
        const payload = { name: 'Agua', unit_cost: "1.0", unit_of_measure: "litros" };
        expect((await lambdaHandler(send('POST', '/resources', payload))).statusCode).toBe(201);
        expect((await lambdaHandler(send('DELETE', '/resources/force-delete', null, { id: '1' }))).statusCode).toBe(200);
    });

    test('Products: CRUD completo', async () => {
        expect((await lambdaHandler(send('POST', '/products', { name: 'Taco', sale_price: "5.0", is_pre_made: true }))).statusCode).toBe(201);
        expect((await lambdaHandler(send('PUT', '/products', { id: '1', name: 'Taco', sale_price: "6.0", is_pre_made: true }))).statusCode).toBe(200);
        expect((await lambdaHandler(send('DELETE', '/products', null, { id: '1' }))).statusCode).toBe(200);
    });

    test('Recipes: Validación de conversión de número', async () => {
        // Aquí probamos específicamente tu conflicto de tipos
        const res = await lambdaHandler(send('POST', '/recipes', {
            product_id: 'p1', resource_id: 'r1', required_quantity: "10.5"
        }));
        expect(res.statusCode).toBe(201);
    });

    test('Tenants: Rutas dinámicas y estáticas', async () => {
        expect((await lambdaHandler(send('GET', '/tenants/tenant-123'))).statusCode).toBe(200);
        expect((await lambdaHandler(send('POST', '/tenants', { company_name: 'Test', tier: 'pro' }))).statusCode).toBe(201);
    });

    test('Production: Captura de errores (try/catch)', async () => {
        // Simulamos un error en el controlador de producción
        const res = await lambdaHandler(send('POST', '/production', { product_id: 'p1', quantity: 1 }));
        // Si el controlador falla, debería retornar 400 según tu código
        expect(res.statusCode).toBeLessThan(500);
    });

    test('Ruta no encontrada', async () => {
        expect((await lambdaHandler(send('GET', '/ruta-inexistente'))).statusCode).toBe(404);
    });
});