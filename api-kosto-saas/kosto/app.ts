import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResource, forceDeleteResource, getResources, softDeleteResource, updateResource } from './src/controllers/resource.controller';
import { buildResponse } from './src/utils/response';
import { handleApiError } from './src/utils/helper-api-error';
import { getTenantFromHeader } from './src/utils/auth';
import { processProduction } from './src/controllers/production.controller';
import { upsertRecipeItem, forceDeleteRecipeItem, getRecipeItem } from './src/controllers/recipe.controller';
import { createProduct, forceDeleteProduct, getProducts, softDeleteProduct, updateProduct } from './src/controllers/product.controller';

// Controllers for tenants and transactions
import { createTenant, getTenant, updateTenant } from './src/controllers/tenant.controller';
import { getTransaction, registerSale } from './src/controllers/transaction.controller';

import { IIdentityService } from '@/models/identity.interface';
import { CognitoIdentityService } from '@/services/cognito-identity.service';

const getBody = (event: APIGatewayProxyEvent) => {
    try { return event.body ? JSON.parse(event.body) : {}; } catch { return {}; }
};

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const identityService: IIdentityService = new CognitoIdentityService();

    try {
        const method = event.httpMethod;
        const path = event.path;

        if (method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-id',
                },
                body: ''
            };
        }

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
                return buildResponse(200, { data: await updateResource(tenantId, b.id, b) });
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
            if (method === 'GET') {
                // Extract the query parameter from the URL: /products?is_pre_made=true
                const isPreMadeParam = event.queryStringParameters?.is_pre_made;

                // Convert the string 'true' to a boolean value
                const isPreMade = isPreMadeParam !== undefined
                    ? isPreMadeParam.toLowerCase() === 'true'
                    : undefined;

                return buildResponse(200, { data: await getProducts(tenantId, isPreMade) });
            }
            if (method === 'POST') {
                const b = getBody(event);
                // El trigger en la BD lanzará el error si se supera el límite.
                // handleApiError lo capturará automáticamente.
                return buildResponse(201, { data: await createProduct(tenantId, b) });
            }
            if (method === 'PUT') {
                const b = getBody(event);
                return buildResponse(200, { data: await updateProduct(tenantId, b.id, b) });
            }
            if (method === 'DELETE') return buildResponse(200, { data: await softDeleteProduct(tenantId, event.queryStringParameters?.id!) });
        }

        // ========================================================
        // CRUD: RECIPES
        // ========================================================
        if (path === '/recipes') {
            if (method === 'GET') return buildResponse(200, { data: await getRecipeItem(tenantId) });
            if (method === 'POST') {
                // La lógica de límite la maneja el TRIGGER en la base de datos.
                // Si el trigger falla, el error llega al 'catch' global y lo manejas con 'handleApiError'.
                const b = getBody(event);
                return buildResponse(201, { data: await upsertRecipeItem(tenantId, b) });
            }
            if (method === 'PUT') {
                const b = getBody(event);
                return buildResponse(200, { data: await upsertRecipeItem(tenantId, b) });
            }
            if (method === 'DELETE') return buildResponse(200, { data: await forceDeleteRecipeItem(tenantId, event.queryStringParameters?.id!) });
        }

        // ========================================================
        // CRUD: TENANTS & SALES
        // ========================================================

        if (path.startsWith('/tenants/')) {
            const id = path.split('/')[2];

            if (method === 'GET') {
                return buildResponse(200, { data: await getTenant(id) });
            }
            if (method === 'PUT') {
                const b = getBody(event);
                console.log("Object in body", b)
                return buildResponse(200, { data: await updateTenant(id, b) });
            }
        }
        // This is the route for GET /tenants and POST /tenants
        else if (path === '/tenants') {
            if (method === 'GET') {
                return buildResponse(200, { data: await getTenant(tenantId) });
            }
            if (method === 'POST') {
                const b = getBody(event);

                // 1. Create in DB (Your current logic)
                const tenant = await createTenant(b.company_name, b.tier);

                // 2. Delegate user creation to a decoupled service
                // This could be a call to an "IdentityManager" that we'll decide what to implement
                await identityService.createUser({
                    email: b.email,
                    password: b.password,
                    tenantId: tenant.id
                });

                return buildResponse(201, { data: tenant });
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
            try {
                const b = getBody(event);
                const result = await processProduction(tenantId, b.product_id, b.quantity);
                return buildResponse(201, { data: result });
            } catch (err: any) {
                // Here is where the magic happens: we capture the error message thrown in the controller
                return buildResponse(400, { error: err.message });
            }
        }

        return buildResponse(404, { error: 'Route not found' });
    } catch (err: any) {
        return handleApiError(err);
    }
};

