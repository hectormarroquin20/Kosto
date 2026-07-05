export const buildResponse = (statusCode: number, body: any) => {
    // If the body has a 'data' property, we normalize it
    if (body && body.data !== undefined) {
        const data = body.data;
        // If it is null or undefined, we convert it to an empty array
        // If it's not an array (it's a single object), we wrap it in an array
        body.data = (data === null || data === undefined)
            ? []
            : (Array.isArray(data) ? data : [data]);
    }

    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*', // Allow any origin (useful for development)
            // 'Access-Control-Allow-Origin': 'http://localhost:4200',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-id',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};