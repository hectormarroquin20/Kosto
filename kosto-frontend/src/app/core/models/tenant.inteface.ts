export interface TenantModel {
    id?: string; // Opcional porque al crear el registro, aún no tiene ID
    company_name: string;
    unit_of_measure: string;
    tier: string;
    created_at: string;
    // Campos necesarios para el registro, aunque no vivan en la tabla tenant
    email?: string;
    password?: string;
}