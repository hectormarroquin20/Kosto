import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TenantService } from '@/core/services/tenant.service';

export const businessOnlyGuard: CanActivateFn = () => {
    const tenantService = inject(TenantService);
    const router = inject(Router);

    // Access the signal value
    const currentTenant = tenantService.tenant();

    if (currentTenant?.tier === 'business') {
        return true;
    }

    router.navigate(['/upgrade-required']);
    return false;
};