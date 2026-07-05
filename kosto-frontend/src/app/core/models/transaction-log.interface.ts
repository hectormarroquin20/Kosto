export interface TransactionLogModel {
    id?: string;
    tenant_id?: string;
    type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT'; // Adjust according to your defined types
    reference_id: string; // ID of the product or related resource
    quantity: number;
    total_amount: number;
    transaction_date?: Date | string;
}