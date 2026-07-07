import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionModalService } from '../../core/services/subscription-modal.service';

@Component({
    selector: 'app-upgrade-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './upgrade-modal.component.html',
    styleUrls: ['./upgrade-modal.component.css']
})
export class UpgradeModalComponent {
    public modalService = inject(SubscriptionModalService);

    onUpgrade() {
        // Navigate to pricing or handle upgrade logic
        window.location.href = '/subscription';
        this.modalService.closeModal();
    }
}