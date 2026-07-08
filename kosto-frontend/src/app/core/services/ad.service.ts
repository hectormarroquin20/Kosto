import { computed, inject, Injectable } from '@angular/core';
import { TenantService } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class AdService {
    private tenantService = inject(TenantService);

    // This computed signal is now reactive: it updates whenever app.ts calls .set()
    shouldShowAds = computed(() => {
        const tier = this.tenantService.tenant()?.tier;
        return tier === 'freemium';
    });
}