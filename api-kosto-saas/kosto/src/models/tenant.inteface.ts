export type SubscriptionTier = 'freemium' | 'pro' | 'business';
export type TransactionType = 'purchase' | 'sale' | 'adjustment';

export interface Tenant {
    id: string;
    company_name: string;
    tier: SubscriptionTier;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}