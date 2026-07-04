// Kosto-monorepo/kosto-frontend/src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { IAuthService } from '../models/auth.interface';

// export const authGuard = () => {
//     const authService = inject(IAuthService);
//     const router = inject(Router);

//     if (authService.isLoggedIn()) {
//         return true;
//     } else {
//         // Si no está logueado, mandamos al login
//         return router.parseUrl('/login');
//     }
// };

export const authGuard = () => {
    const authService = inject(IAuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    }

    return router.parseUrl('/login');
};