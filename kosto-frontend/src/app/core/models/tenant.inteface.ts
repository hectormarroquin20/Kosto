export interface TenantModel {
    id?: string; // Optional because at the time of creating the record, it does not have an ID
    company_name: string;
    tier: string;
    created_at?: string;
    is_active: boolean;
    updated_at?: string;
    // Necessary fields for registration, although they do not live in the tenant table (user data)
    email?: string;
    password?: string;
}