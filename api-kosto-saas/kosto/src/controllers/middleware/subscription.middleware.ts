import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../../services/subscription.service';

export const checkTenantLimit = (actionType: 'products' | 'resources' | 'transactions') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.headers['x-tenant-id'] as string;

        if (!tenantId) {
            return res.status(400).json({ error: 'x-tenant-id header is required' });
        }

        try {
            const isAllowed = await SubscriptionService.checkLimits(tenantId, actionType);

            if (!isAllowed) {
                return res.status(403)
                    .setHeader('X-Limit-Exceeded', 'true')
                    .json({ error: 'Subscription limit exceeded' });
            }

            next();
        } catch (error) {
            console.error('Limit check error:', error);
            res.status(500).json({ error: 'Internal server error during limit check' });
        }
    };
};

