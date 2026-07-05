export interface ProductModel {
    id: string;
    tenant_id: string;
    name: string;
    sale_price: number;
    current_stock: number;
    created_at?: string;
    updated_at?: string;
    is_pre_made: boolean;
    is_active?: boolean
};