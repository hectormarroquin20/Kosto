// import { Service } from '@angular/core';
import { inject, Injectable, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, tap } from 'rxjs';
import { IAuthService } from '../models/auth.interface';

// // @Service()
// @Injectable({ providedIn: 'root' })
// export class Auth {
//     private authStatus = signal(!!localStorage.getItem('user_session'));
//     private readonly mockTenantId = '11111111-1111-1111-1111-111111111111';

//     // Estado del login
//     isLoggedIn(): boolean {
//         // return !!localStorage.getItem('user_session');
//         return this.authStatus();
//     }

//     login(email: string) {
//         // Simulamos un login exitoso guardando algo en localStorage
//         // localStorage.setItem('user_session', JSON.stringify({ email, role: 'admin' }));
//         localStorage.setItem('user_session', JSON.stringify({ email }));
//         this.authStatus.set(true);
//     }

//     logout() {
//         // localStorage.removeItem('user_session');
//         localStorage.removeItem('user_session');
//         this.authStatus.set(false);
//     }

//     getTenantId(): string {
//         return this.mockTenantId;
//     }
// }

@Injectable({ providedIn: 'root' })
export class Auth implements IAuthService {
    // La única clase que sabe que existe Cognito
    private oidcSecurityService = inject(OidcSecurityService);

    // Usamos Signals para mantener el estado de forma síncrona para los componentes
    private authenticatedSignal = signal<boolean>(false);
    private userDataSignal = signal<any>(null);
    private accessTokenSignal = signal<string>('');

    /**
     * Método de inicialización (Gateway). 
     * Lo llamaremos una sola vez desde el app.ts
     */
    checkAuth(): Observable<any> {
        return this.oidcSecurityService.checkAuth().pipe(
            tap(loginResponse => {
                console.log("DEBUG - UserData completo:", loginResponse.userData);
                this.authenticatedSignal.set(loginResponse.isAuthenticated);
                this.userDataSignal.set(loginResponse.userData);
                this.accessTokenSignal.set(loginResponse.accessToken || '');
            })
        );
    }

    isLoggedIn(): boolean { return this.authenticatedSignal(); }
    login(): void { this.oidcSecurityService.authorize(); }
    logout(): void { this.oidcSecurityService.logoff().subscribe(); }
    getToken(): string { return this.accessTokenSignal(); }

    getTenantId(): string | null {
        const user = this.userDataSignal();
        console.log("DEBUG - Usuario cargado en signal:", user);
        if (user && user['custom:tenant_id']) return user['custom:tenant_id'];
        return localStorage.getItem('tenant_id') || 'tenant-dev-123';
    }
}