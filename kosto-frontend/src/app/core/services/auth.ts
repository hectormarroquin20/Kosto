// import { Service } from '@angular/core';
import { Injectable, signal } from '@angular/core';

// @Service()
@Injectable({ providedIn: 'root' })
export class Auth {
    private authStatus = signal(!!localStorage.getItem('user_session'));
    private readonly mockTenantId = '11111111-1111-1111-1111-111111111111';

    // Estado del login
    isLoggedIn(): boolean {
        // return !!localStorage.getItem('user_session');
        return this.authStatus();
    }

    login(email: string) {
        // Simulamos un login exitoso guardando algo en localStorage
        // localStorage.setItem('user_session', JSON.stringify({ email, role: 'admin' }));
        localStorage.setItem('user_session', JSON.stringify({ email }));
        this.authStatus.set(true);
    }

    logout() {
        // localStorage.removeItem('user_session');
        localStorage.removeItem('user_session');
        this.authStatus.set(false);
    }

    getTenantId(): string {
        return this.mockTenantId;
    }
}