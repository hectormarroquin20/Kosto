import { Observable } from 'rxjs';

export abstract class IAuthService {
    abstract isLoggedIn(): boolean;
    abstract login(): void;
    abstract logout(): void;
    abstract getToken(): string;
    abstract getTenantId(): string | null;
    abstract checkAuth(): Observable<any>;
}