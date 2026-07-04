export interface Resource {
    id?: string;
    tenant_id: string;
    name: string;
    unit_of_measure: string;
    unit_cost: number;
    current_stock: number;
    // Soft delete flag
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}