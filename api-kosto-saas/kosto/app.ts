import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResource, forceDeleteResource, getResources, softDeleteResource, updateResource } from './src/controllers/resource.controller';
import { buildResponse } from './src/utils/response';
import { getTenantFromHeader } from './src/utils/auth';
import { processProduction } from './src/controllers/production.controller';
import { addRecipeItem, forceDeleteRecipeItem, getRecipeItem, softDeleteRecipeItem, updateRecipeItem } from './src/controllers/recipe.controller';
import { createProduct, forceDeleteProduct, getProducts, softDeleteProduct, updateProduct } from './src/controllers/product.controller';
import { createTenant, getTenant, updateTenant } from './src/controllers/tenant.controller';
import { getTransaction, registerSale } from './src/controllers/transaction.controller';

const getBody = (event: APIGatewayProxyEvent) => {
    try { return event.body ? JSON.parse(event.body) : {}; } catch { return {}; }
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const method = event.httpMethod;
        const path = event.path;
        if (method === 'OPTIONS') return buildResponse(200, {});

        let tenantId = '';
        if (path !== '/tenants' || method !== 'POST') {
            const tId = getTenantFromHeader(event);
            if (!tId) return buildResponse(401, { error: 'Unauthorized: Missing x-tenant-id' });
            tenantId = tId;
        }

        // ========================================================
        // CRUD: RESOURCES
        // ========================================================
        if (path === '/resources/force-delete' && method === 'DELETE') {
            await forceDeleteResource(tenantId, event.queryStringParameters?.id!);
            return buildResponse(200, { message: 'Resource physically deleted' });
        }
        if (path === '/resources') {
            if (method === 'GET') return buildResponse(200, { data: await getResources(tenantId) });
            if (method === 'POST') return buildResponse(201, { data: await createResource(tenantId, getBody(event)) });
            if (method === 'PUT') {
                const b = getBody(event);
                return buildResponse(200, { data: await updateResource(tenantId, b.id, b.name, b.unit_of_measure, parseFloat(b.unit_cost)) });
            }
            if (method === 'DELETE') return buildResponse(200, { data: await softDeleteResource(tenantId, event.queryStringParameters?.id!) });
        }

        // ========================================================
        // CRUD: PRODUCTS
        // ========================================================
        if (path === '/products/force-delete' && method === 'DELETE') {
            await forceDeleteProduct(tenantId, event.queryStringParameters?.id!);
            return buildResponse(200, { message: 'Product physically deleted' });
        }
        if (path === '/products') {
            if (method === 'GET') return buildResponse(200, { data: await getProducts(tenantId) });
            if (method === 'POST') {
                const b = getBody(event);
                return buildResponse(201, { data: await createProduct(tenantId, b.name, parseFloat(b.sale_price), !!b.is_pre_made) });
            }
            if (method === 'PUT') {
                const b = getBody(event);
                return buildResponse(200, { data: await updateProduct(tenantId, b.id, b.name, parseFloat(b.sale_price), !!b.is_pre_made) });
            }
            if (method === 'DELETE') return buildResponse(200, { data: await softDeleteProduct(tenantId, event.queryStringParameters?.id!) });
        }

        // ========================================================
        // CRUD: RECIPES
        // ========================================================
        if (path === '/recipes/force-delete' && method === 'DELETE') {
            await forceDeleteRecipeItem(tenantId, event.queryStringParameters?.id!);
            return buildResponse(200, { message: 'Recipe physically deleted' });
        }
        if (path === '/recipes') {
            if (method === 'GET') return buildResponse(200, { data: await getRecipeItem(tenantId) });
            if (method === 'POST') {
                const b = getBody(event);
                return buildResponse(201, { data: await addRecipeItem(tenantId, b.product_id, b.resource_id, b.quantity) });
            }
            if (method === 'PUT') {
                const b = getBody(event);
                return buildResponse(200, { data: await updateRecipeItem(tenantId, b.id, b.product_id, b.resource_id, b.quantity) });
            }
            if (method === 'DELETE') return buildResponse(200, { data: await softDeleteRecipeItem(tenantId, event.queryStringParameters?.id!) });
        }

        // ========================================================
        // CRUD: TENANTS & SALES
        // ========================================================
        // ========================================================
        // CRUD: TENANTS
        // ========================================================

        // 1. Rutas Dinámicas: /tenants/{id}
        if (path.startsWith('/tenants/')) {
            const id = path.split('/')[2];

            if (method === 'GET') {
                return buildResponse(200, { data: await getTenant(id) });
            }
            if (method === 'PUT') {
                const b = getBody(event);
                console.log("Objeto en body", b)
                return buildResponse(200, { data: await updateTenant(id, b.company_name, b.tier, b.is_active) });
            }
        }
        // Esta es la ruta para: GET /tenants y POST /tenants
        else if (path === '/tenants') {
            if (method === 'GET') {
                return buildResponse(200, { data: await getTenant(tenantId) });
            }
            if (method === 'POST') {
                const b = getBody(event);
                return buildResponse(201, { data: await createTenant(b.company_name, b.tier) });
            }
        }

        if (path === '/sales') {
            if (method === 'GET') return buildResponse(200, { data: await getTransaction(tenantId) });
            if (method === 'POST') {
                const b = getBody(event);
                return buildResponse(201, { data: await registerSale(tenantId, b.reference_id, b.quantity, b.total_amount) });
            }
        }

        if (path === '/production' && method === 'POST') {
            const b = getBody(event);
            return buildResponse(201, { data: await processProduction(tenantId, b.reference_id, b.quantity) });
        }

        return buildResponse(404, { error: 'Route not found' });
    } catch (err: any) {
        console.error('--- ERROR DETALLADO ---');
        console.error(err);
        return buildResponse(500, { error: 'Internal Server Error', details: err.message });
    }
};