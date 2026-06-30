// src/models/types.ts

export type SubscriptionTier = 'freemium' | 'pro' | 'business';
export type TransactionType = 'purchase' | 'sale' | 'adjustment';

export interface Tenant {
    id: string;
    company_name: string;
    tier: SubscriptionTier;
    created_at?: Date;
}

export interface Resource {
    id?: string; // Opcional porque se genera en la DB (UUID)
    tenant_id: string;
    name: string;
    unit_of_measure: string;
    unit_cost: number;
    current_stock: number;
    created_at?: Date;
    updated_at?: Date;
}

// Tipo útil para cuando insertamos un nuevo recurso (no enviamos ID ni fechas)
export type CreateResourceDTO = Omit<Resource, 'id' | 'created_at' | 'updated_at'>;