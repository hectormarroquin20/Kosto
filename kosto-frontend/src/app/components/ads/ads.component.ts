import { Component, inject } from '@angular/core';
import { AdService } from '../../core/services/ad.service';

@Component({
  selector: 'app-ad-banner',
  standalone: true,
  styles: [`.ad-banner {
      width: 300px; /* O el tamaño que prefieras para tu publicidad */
      height: 100%;
      background-color: #f8f9fa;
      border-left: 1px solid #ddd;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      color: gray;
      box-shadow: 0 4px 8px rgba(0, 0, 0.1);
    }`],
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