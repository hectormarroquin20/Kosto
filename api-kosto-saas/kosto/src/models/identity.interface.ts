export interface IIdentityService {
    createUser(data: { email: string, password: string, tenantId: string }): Promise<void>;
    assignTenantToUser(email: string, tenantId: string): Promise<void>;
}