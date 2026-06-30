import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(Auth);
    const tenantId = authService.getTenantId();

    const reqWithHeader = req.clone({
        headers: req.headers.set('x-tenant-id', tenantId)
    });

    return next(reqWithHeader);
};