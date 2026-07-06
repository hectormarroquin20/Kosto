import { dbPool } from '../db/database';
import { TIER_CONFIG } from './subscription.config';
import { Tenant } from '../models/tenant.inteface';

export const SubscriptionService = {
    async checkLimits(tenantId: string, actionType: 'products' | 'resources' | 'transactions'): Promise<boolean> {
        const client = await dbPool.connect();
        try {
            // 1. Get Tenant Tier
            const tenantRes = await client.query('SELECT tier FROM tenant WHERE id = $1', [tenantId]);
            if (tenantRes.rowCount === 0) throw new Error('Tenant not found');

            const tier = tenantRes.rows[0].tier as keyof typeof TIER_CONFIG;
            const limit = TIER_CONFIG[tier][actionType];

            // NOTE: Even for business tier, we might still want to check if limit is Infinity
            // However, the real issue in tests is that mockClient.query is somehow called twice.
            // Let's re-read the code logic.
            // In SubscriptionService, if limit === Infinity, it returns true immediately.
            if (limit === Infinity) return true;

            // 2. Get Usage
            let currentUsage = 0;
            if (actionType === 'transactions') {
                const usageRes = await client.query('SELECT usage_count, period_start FROM tenant_usage WHERE tenant_id = $1', [tenantId]);
                const data = usageRes.rows[0];
                if (!data) return true;

                const now = new Date();
                const lastPeriod = new Date(data.period_start);

                if (now.getMonth() !== lastPeriod.getMonth() || now.getFullYear() !== lastPeriod.getFullYear()) {
                    await client.query(`
            UPDATE tenant_usage SET usage_count = 0, period_start = CURRENT_TIMESTAMP
            WHERE tenant_id = $1`, [tenantId]);
                    return true;
                }
                currentUsage = data.usage_count || 0;
            } else {
                // Count active products or resources
                const table = actionType === 'products' ? 'product' : 'resource';
                const countRes = await client.query(`SELECT COUNT(*) FROM ${table} WHERE tenant_id = $1 AND is_active = TRUE`, [tenantId]);

                if (countRes && countRes.rows && countRes.rows[0]) {
                    currentUsage = parseInt(countRes.rows[0].count || 0);
                }
            }

            return currentUsage < limit;
        } finally {
            client.release();
        }
    }
};

