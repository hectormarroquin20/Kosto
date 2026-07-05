import { IIdentityService } from '@/models/identity.interface';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";

export class CognitoIdentityService implements IIdentityService {
    private client = new CognitoIdentityProviderClient({ region: "us-east-1" });

    async createUser(data: { email: string, password: string, tenantId: string }): Promise<void> {
        const command = new AdminCreateUserCommand({
            UserPoolId: 'us-east-1_eAzPdrLjW',
            Username: data.email,
            UserAttributes: [
                { Name: 'email', Value: data.email },
                { Name: 'email_verified', Value: 'true' },
                { Name: 'custom:tenant_id', Value: data.tenantId }
            ],
            MessageAction: 'SUPPRESS',
            TemporaryPassword: data.password
        });

        await this.client.send(command);
    }

    async assignTenantToUser(email: string, tenantId: string): Promise<void> {
        const command = new AdminUpdateUserAttributesCommand({
            UserPoolId: 'us-east-1_eAzPdrLjW',
            Username: email,
            UserAttributes: [
                { Name: 'custom:tenant_id', Value: tenantId }
            ]
        });
        await this.client.send(command);
        console.log(`✅ User ${email} updated with tenant ${tenantId}`);
    }
}