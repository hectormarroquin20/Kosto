import { IIdentityService } from '@/models/identity.interface';

export class MockIdentityService implements IIdentityService {
    async createUser(data: { email: string, password: string, tenantId: string }): Promise<void> {
        console.log('🚀 [MockIdentityService] Simulando creación de usuario en proveedor de identidad...');
        console.log('Datos recibidos:', data);

        // Simulamos un retraso de red
        return new Promise((resolve) => setTimeout(resolve, 500));
    }
}