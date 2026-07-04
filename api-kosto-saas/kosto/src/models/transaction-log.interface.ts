export interface TransactionLogModel {
    id?: string;
    tenant_id?: string;
    type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT'; // Ajusta según tus tipos definidos
    reference_id: string; // ID del producto o recurso relacionado
    quantity: number;
    total_amount: number;
    transaction_date?: Date | string;
}