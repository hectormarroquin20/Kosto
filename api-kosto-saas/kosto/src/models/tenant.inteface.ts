export type SubscriptionTier = 'freemium' | 'pro' | 'business';

export interface Tenant {
    id: string;
    company_name: string;
    tier: SubscriptionTier;
    admin_email: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

// ... existing code ...
