export interface RecipeItem {
    id: string;
    tenant_id: string,
    product_id: string;
    resource_id: string;
    required_quantity: number;
    is_active: boolean;
}
