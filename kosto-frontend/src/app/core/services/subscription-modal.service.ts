import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SubscriptionModalService {
    showModal = signal(false);

    openUpgradeModal() {
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }
}