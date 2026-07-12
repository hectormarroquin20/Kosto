import { CognitoIdentityService } from "./cognito-identity.service";
import { IIdentityService } from "@/models/identity.interface";
import { createTenant, forceDeleteTenant } from "@/controllers/tenant.controller";

export const registerTenantFlow = async (data: any) => {
    // 1. Create in the database (with its own internal connection)
    const tenant = await createTenant(data.company_name, data.tier);
    const identityService: IIdentityService = new CognitoIdentityService();

    try {
        // 2. Attempt to register in Cognito
        await identityService.createUser({
            email: data.email,
            password: data.password,
            tenantId: tenant.id
        });

        return tenant;
    } catch (error) {
        console.error(`ERROR: Registro de tenant ${tenant.id} falló en Cognito. Iniciando compensación...`);
        try {
            await forceDeleteTenant(tenant.id);
            console.info(`Compensación exitosa: Tenant ${tenant.id} borrado.`);
        } catch (cleanupError) {
            // Aquí es donde disparas una alerta de nivel crítico
            console.error(`CRITICAL: La compensación falló para el tenant ${tenant.id}. Requiere atención manual.`, cleanupError);
        }
        throw error;
    }
};