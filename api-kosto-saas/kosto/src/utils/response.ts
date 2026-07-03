export const buildResponse = (statusCode: number, body: any) => {
    // Si el cuerpo tiene una propiedad 'data', la normalizamos
    if (body && body.data !== undefined) {
        const data = body.data;
        // Si es null o undefined, lo convertimos en array vacío
        // Si no es un array (es un objeto único), lo envolvemos en un array
        body.data = (data === null || data === undefined)
            ? []
            : (Array.isArray(data) ? data : [data]);
    }

    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*', // Permitir cualquier origen (útil para desarrollo)
            // 'Access-Control-Allow-Origin': 'http://localhost:4200',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-tenant-id',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
};