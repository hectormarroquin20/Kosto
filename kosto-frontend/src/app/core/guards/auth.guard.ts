import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard = () => {
    const authService = inject(Auth);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    } else {
        // Si no está logueado, mandamos al login
        return router.parseUrl('/login');
    }
};