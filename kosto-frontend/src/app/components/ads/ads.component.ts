import { Component, inject } from '@angular/core';
import { AdService } from '../../core/services/ad.service';

@Component({
    selector: 'app-ad-banner',
    standalone: true,
    template: `
    @if (adService.shouldShowAds()) {
      <div class="ad-banner">
        <!-- Google AdSense Code here -->
        <p>Support Kosto: <a href="/subscription">Upgrade to remove ads</a></p>
      </div>
    }
  `
})
export class AdBannerComponent {
    adService = inject(AdService);
}