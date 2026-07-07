import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AdService {
    // This would typically be set after the user/tenant is loaded
    tier = signal<string>('freemium');

    shouldShowAds = computed(() => this.tier() === 'freemium');
}