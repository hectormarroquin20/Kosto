// import { computed, inject, Injectable } from '@angular/core';
// import { TenantService } from './tenant.service';

// @Injectable({ providedIn: 'root' })
// export class AdService {
//     private tenantService = inject(TenantService);

//     // This computed signal is now reactive: it updates whenever app.ts calls .set()
//     shouldShowAds = computed(() => {
//         const tier = this.tenantService.tenant()?.tier;
//         return tier === 'freemium';
//     });
// }

import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TenantService } from './tenant.service';

// Tipado para detectar entornos nativos y la API global de AdMob/Monetag
declare var Capacitor: any;
declare var AdMob: any;

@Injectable({ providedIn: 'root' })
export class AdService {
    private tenantService = inject(TenantService);
    private router = inject(Router);

    // Mantenemos tu signal reactivo intacto
    shouldShowAds = computed(() => {
        const tier = this.tenantService.tenant()?.tier;
        return tier === 'freemium';
    });

    /**
     * Muestra el video de 15s si el usuario está en el tier 'freemium'.
     * @returns Promise<boolean> - true si vio el video o es Pro/Business, false si canceló o usa AdBlock.
     */
    async showRewardedAd(): Promise<boolean> {
        // Usamos tu computed signal: si NO es freemium (Pro/Business), da acceso directo
        if (!this.shouldShowAds()) {
            return true;
        }

        const isNativeMobile = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();

        if (isNativeMobile) {
            return this.showMobileRewardedAd();
        } else {
            return this.showWebRewardedAd();
        }
    }

    // --- LÓGICA MÓVIL (Capacitor + AdMob) ---
    private async showMobileRewardedAd(): Promise<boolean> {
        try {
            await AdMob.prepareRewardVideoAd({
                adId: 'ca-app-pub-3940256099942544/5224354917', // ID de prueba de AdMob
            });

            return new Promise<boolean>((resolve) => {
                const rewardListener = AdMob.addListener('onRewarded', () => {
                    rewardListener.remove();
                    resolve(true);
                });

                const dismissListener = AdMob.addListener('onRewardedVideoAdDismissed', () => {
                    dismissListener.remove();
                    resolve(false);
                });

                const errorListener = AdMob.addListener('onRewardedVideoAdFailedToLoad', () => {
                    errorListener.remove();
                    resolve(false);
                });

                AdMob.showRewardVideoAd();
            });
        } catch (error) {
            console.error('Error cargando AdMob en insummi:', error);
            return false;
        }
    }

    // --- LÓGICA WEB (Monetag) ---
    private async showWebRewardedAd(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            // Si Monetag cargó correctamente en el objeto window
            if ((window as any).monetagWebAd) {
                (window as any).monetagWebAd.show()
                    .then((completed: boolean) => resolve(completed))
                    .catch(() => resolve(false));
            } else {
                // Si el script no existe o un AdBlocker bloqueó Monetag
                const userWantsPro = confirm(
                    'Estás utilizando la versión Freemium de insummi. Desactiva tu bloqueador de anuncios o pásate al plan Pro para continuar.'
                );

                if (userWantsPro) {
                    this.router.navigate(['/subscription']);
                }
                resolve(false);
            }
        });
    }
}