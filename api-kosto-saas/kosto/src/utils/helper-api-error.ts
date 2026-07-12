import { APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "./response";

export const handleApiError = (err: any): APIGatewayProxyResult => {
    console.error('--- DETAILED ERROR ---', err);

    // Detection of Cognito error (Password Policy)
    if (err.name === 'InvalidPasswordException' || err.message?.includes('password')) {
        return buildResponse(400, {
            code: 'ERROR_PASSWORD_POLICY',
            error: 'The password does not meet the security requirements.'
        });
    }

    if (err.message === 'TENANT_ALREADY_EXISTS') {
        return buildResponse(409, {
            code: 'TENANT_EXISTS',
            error: 'There is already a company registered with this email.'
        });
    }

    // If the error comes from Postgres (triggered by RAISE EXCEPTION)
    if (err.message && err.message.includes('LIMIT_EXCEEDED')) {
        return {
            statusCode: 403,
            headers: { 'X-Limit-Exceeded': 'true', 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Subscription limit reached. Please upgrade your plan.' })
        };
    }

    // Custom validation errors
    if (err.message.includes('ValidationError')) {
        return buildResponse(400, { error: err.message });
    }

    // Default error
    return buildResponse(500, { error: 'Internal Server Error', details: err.message });
};