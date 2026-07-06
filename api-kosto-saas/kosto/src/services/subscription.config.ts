import { SubscriptionTier } from "@/models/tenant.inteface";

export const TIER_CONFIG: Record<SubscriptionTier, { products: number | typeof Infinity; resources: number | typeof Infinity; transactions: number | typeof Infinity }> = {
    freemium: {
        products: parseInt(process.env.FREEMIUM_MAX_PRODUCTS || '15'),
        resources: parseInt(process.env.FREEMIUM_MAX_RESOURCES || '50'),
        transactions: parseInt(process.env.FREEMIUM_MAX_TRANSACTIONS || '100'),
    },
    pro: {
        products: parseInt(process.env.PRO_MAX_PRODUCTS || '500'),
        resources: parseInt(process.env.PRO_MAX_RESOURCES || '500'),
        transactions: parseInt(process.env.PRO_MAX_TRANSACTIONS || '1000'),
    },
    business: {
        products: Infinity,
        resources: Infinity,
        transactions: Infinity,
    },
};
