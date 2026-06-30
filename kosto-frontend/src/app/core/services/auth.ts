import { Service } from '@angular/core';

@Service()
export class Auth {
    // Pon aquí el UUID real que estás usando en tu base de datos de Docker
    private readonly mockTenantId = '11111111-1111-1111-1111-111111111111';

    getTenantId(): string {
        return this.mockTenantId;
    }
}