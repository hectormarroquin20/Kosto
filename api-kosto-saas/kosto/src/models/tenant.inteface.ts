export type SubscriptionTier = 'freemium' | 'pro' | 'business';
export type TransactionType = 'purchase' | 'sale' | 'adjustment';

export interface Tenant {
    id: string;
    company_name: string;
    tier: SubscriptionTier;
    created_at?: Date;
}