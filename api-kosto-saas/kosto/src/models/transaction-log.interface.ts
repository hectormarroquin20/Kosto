export type TransactionType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT';

export interface TransactionLogModel {
    id?: string;
    tenant_id?: string;
    type: TransactionType;
    reference_id: string;
    quantity: number;
    total_amount: number;
    transaction_date?: Date | string;
}