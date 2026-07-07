import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { TenantModel } from '../models/tenant.inteface';
import { environment } from '@root/src/environments/environment';

@Service()
export class TenantService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;

    public tenant = signal<TenantModel | null>(null);

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

    public isBusinessTier = computed(() => this.tenant()?.tier === 'business');

    // Add to TenantService
    public canExport = computed(() => ['pro', 'business'].includes(this.tenant()?.tier || ''));
}



