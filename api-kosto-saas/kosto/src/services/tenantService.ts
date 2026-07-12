import { CognitoIdentityService } from "./cognito-identity.service";
import { IIdentityService } from "@/models/identity.interface";
import { createTenant, findTenantByEmail, forceDeleteTenant } from "@/controllers/tenant.controller";

export const registerTenantFlow = async (data: any) => {
    // 1. Pre-verification (Idempotency)
    const existing = await findTenantByEmail(data.email);
    if (existing) throw new Error("TENANT_ALREADY_EXISTS");

    // 2. Attempt creation in DB
    const tenant = await createTenant(data.company_name, data.tier, data.email);
    const identityService: IIdentityService = new CognitoIdentityService();

    try {
        // 3. Creation in Cognito
        await identityService.createUser({
            email: data.email,
            password: data.password,
            tenantId: tenant.id
        });
        return tenant;
    } catch (error) {
        // 4. Compensation (Only if Cognito failed)
        console.error(`ERROR: Failure in Cognito. Initiating rollback for ${tenant.id}...`);
        await forceDeleteTenant(tenant.id).catch(e => {
            // Critical log: Send to SNS or Slack webhook
            console.error(`CRITICAL: Failure in rollback for ${tenant.id}`, e);
        });
        throw error;
    }
};