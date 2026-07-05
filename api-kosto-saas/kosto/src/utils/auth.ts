import { APIGatewayProxyEvent } from "aws-lambda";

export const getTenantFromHeader = (event: APIGatewayProxyEvent): string | null => {
    const headers = event.headers;

    // We search for the key ignoring case
    const foundKey = Object.keys(headers).find(k => k.toLowerCase() === 'x-tenant-id');

    // If we find the key, return its value (or null if the value were undefined)
    // If we don't find the key, return null explicitly
    return foundKey ? (headers[foundKey] ?? null) : null;
};