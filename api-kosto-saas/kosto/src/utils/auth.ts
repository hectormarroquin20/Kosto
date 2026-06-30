import { APIGatewayProxyEvent } from "aws-lambda";

export const getTenantFromHeader = (event: APIGatewayProxyEvent): string | null => {
    const headers = event.headers;

    // Buscamos la llave ignorando mayúsculas/minúsculas
    const foundKey = Object.keys(headers).find(k => k.toLowerCase() === 'x-tenant-id');

    // Si encontramos la llave, retornamos su valor (o null si el valor fuera undefined)
    // Si no encontramos la llave, retornamos null explícitamente
    return foundKey ? (headers[foundKey] ?? null) : null;
};