import { APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "./response";

export const handleApiError = (err: any): APIGatewayProxyResult => {
    console.error('--- DETAILED ERROR ---', err);

    // Si el error viene de Postgres (triggered por RAISE EXCEPTION)
    if (err.message && err.message.includes('LIMIT_EXCEEDED')) {
        return {
            statusCode: 403,
            headers: { 'X-Limit-Exceeded': 'true', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Subscription limit reached. Please upgrade your plan.' })
        };
    }

    // Errores de validación personalizados
    if (err.message.includes('ValidationError')) {
        return buildResponse(400, { error: err.message });
    }

    // Default error
    return buildResponse(500, { error: 'Internal Server Error', details: err.message });
};