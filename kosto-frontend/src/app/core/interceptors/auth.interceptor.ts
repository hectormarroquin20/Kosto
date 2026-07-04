import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { IAuthService } from '../models/auth.interface';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(IAuthService);
    const tenantId = authService.getTenantId();

    const reqWithHeader = req.clone({
        headers: tenantId ? req.headers.set('x-tenant-id', tenantId) : req.headers
    });

    return next(reqWithHeader);
};