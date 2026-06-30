import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { TenantModel } from '../models/tenant.inteface';

@Service()
export class Tenant {
    private readonly http = inject(HttpClient); // <--- Así se inyecta ahora
    private readonly apiUrl = 'http://127.0.0.1:3000';

    getTenants() {
        return this.http.get<TenantModel[]>(`${this.apiUrl}/tenants`);
    }

    getTenantbyId(id: string) {
        return this.http.get<TenantModel[]>(`${this.apiUrl}/tenants/${id}`);
    }

    createTenant(resource: Partial<TenantModel>) {
        return this.http.post<TenantModel>(`${this.apiUrl}/tenants`, resource);
    }

    updateTenant(tenant: TenantModel) {
        if (!tenant.id) {
            throw new Error("No se puede actualizar sin un ID válido");
        }
        return this.http.put(`${this.apiUrl}/tenants/${tenant.id}`, tenant);
    }

    deleteTenant(id: string) {
        return this.http.delete(`${this.apiUrl}/tenants`, { params: { id } });
    }
}