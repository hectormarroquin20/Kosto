import { inject, Injectable, signal } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable, tap } from 'rxjs';
import { IAuthService } from '../models/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService implements IAuthService {
    // The only class that knows Cognito exists
    private oidcSecurityService = inject(OidcSecurityService);

    // Using Signals to maintain state synchronously for components
    private authenticatedSignal = signal<boolean>(false);
    private userDataSignal = signal<any>(null);
    private accessTokenSignal = signal<string>('');

    /**
     * Initialization method (Gateway). 
     * We will call it only once from app.ts
     */
    checkAuth(): Observable<any> {
        return this.oidcSecurityService.checkAuth().pipe(
            tap(loginResponse => {
                console.log("DEBUG - Complete user data:", loginResponse.userData);
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
        console.log("DEBUG - User loaded in signal:", user);
        if (user && user['custom:tenant_id']) return user['custom:tenant_id'];
        return localStorage.getItem('tenant_id') || 'tenant-dev-123';
    }
}