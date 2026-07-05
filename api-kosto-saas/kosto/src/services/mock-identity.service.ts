// src/services/mock-identity.service.ts

import { IIdentityService } from '@/models/identity.interface';

export class MockIdentityService implements IIdentityService {
    async assignTenantToUser(email: string, tenantId: string): Promise<void> {
        console.log('🚀 [MockIdentityService] Assigning tenant to user...');
        console.log('Email:', email, 'TenantId:', tenantId);

        // Simulating network delay
        return new Promise((resolve) => setTimeout(resolve, 300));
    }
    async createUser(data: { email: string, password: string, tenantId: string }): Promise<void> {
        console.log('🚀 [MockIdentityService] Simulating user creation in identity provider...');
        console.log('Data received:', data);

        // Simulating network delay
        return new Promise((resolve) => setTimeout(resolve, 500));
    }
}