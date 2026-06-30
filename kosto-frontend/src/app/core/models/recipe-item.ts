export interface RecipeItem {
    id: string;
    product_id: string;
    resource_id: string;
    required_quantity: number | string;
    is_active: boolean;
}
