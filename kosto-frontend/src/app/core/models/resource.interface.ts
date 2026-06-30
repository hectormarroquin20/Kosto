export interface ResourceModel {
    id: string;
    tenant_id: string;
    name: string;
    unit_of_measure: string;
    unit_cost: number;
    current_stock: number;
    created_at: string;
}