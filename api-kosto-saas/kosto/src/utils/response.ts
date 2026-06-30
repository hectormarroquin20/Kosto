export const buildResponse = (statusCode: number, body: any) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': 'http://localhost:4200',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};