export interface ProductModel {
    id: string;
    tenant_id: string;
    name: string;
    sale_price: number;
    current_stock: number;
    is_pre_made: boolean;
    created_at: string;
    is_active: boolean
};