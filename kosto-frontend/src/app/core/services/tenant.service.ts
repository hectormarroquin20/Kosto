import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { TenantModel } from '../models/tenant.inteface';
import { environment } from '@root/src/environments/environment';

@Service()
export class TenantService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

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
            throw new Error("Cannot update without a valid ID");
        }
        return this.http.put(`${this.apiUrl}/tenants/${tenant.id}`, tenant);
    }

    deleteTenant(id: string) {
        return this.http.delete(`${this.apiUrl}/tenants`, { params: { id } });
    }
}