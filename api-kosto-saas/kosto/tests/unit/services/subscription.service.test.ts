import { afterEach, beforeEach, describe, expect, it, jest, test } from '@jest/globals';
import { SubscriptionService } from '../../../src/services/subscription.service';
import { dbPool } from '../../../src/db/database';

jest.mock('../../../src/db/database', () => ({
    dbPool: {
        connect: jest.fn(),
    },
}));

describe('SubscriptionService', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        (dbPool.connect as jest.Mock<any>).mockResolvedValue(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return true if tier is business (unlimited)', async () => {
        // Business tier has Infinity limit
        mockClient.query.mockResolvedValueOnce({ rows: [{ tier: 'business' }], rowCount: 1 });

        const result = await SubscriptionService.checkLimits('tenant-1', 'products');
        expect(result).toBe(true);
        // Business tier bypasses count, so only 1 query for tier check
        expect(mockClient.query).toHaveBeenCalledTimes(1);
    });

    it('should return false if limit is exceeded', async () => {
        // Mock tier as freemium (limit 15)
        mockClient.query.mockResolvedValueOnce({ rows: [{ tier: 'freemium' }], rowCount: 1 });
        // Mock count query result (16 products)
        mockClient.query.mockResolvedValueOnce({ rows: [{ count: '16' }] });

        const result = await SubscriptionService.checkLimits('tenant-1', 'products');
        expect(result).toBe(false);
        // Verify two queries were called: tier check AND count check
        expect(mockClient.query).toHaveBeenCalledTimes(2);
    });
});

