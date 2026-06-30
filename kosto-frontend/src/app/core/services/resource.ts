import { inject, Service } from '@angular/core';
import { ResourceModel } from '../models/resource.interface';
import { HttpClient } from '@angular/common/http';

@Service()
export class Resource {
    private readonly http = inject(HttpClient); // <--- Así se inyecta ahora
    private readonly apiUrl = 'http://127.0.0.1:3000';

    getResources() {
        return this.http.get<ResourceModel[]>(`${this.apiUrl}/resources`);
    }

    createResource(resource: Partial<ResourceModel>) {
        return this.http.post<ResourceModel>(`${this.apiUrl}/resources`, resource);
    }

    updateResource(resource: ResourceModel) {
        return this.http.put<ResourceModel>(`${this.apiUrl}/resources`, resource);
    }

    deleteResource(id: string) {
        return this.http.delete(`${this.apiUrl}/resources`, { params: { id } });
    }
}
