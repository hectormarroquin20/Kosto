export interface TenantUsage {
    tenant_id: string;
    period_start: Date;
    usage_count: number;
    updated_at?: Date;
}
