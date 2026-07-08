import { Component, inject } from '@angular/core';
import { AdBannerComponent } from '../../../components/ads/ads.component';

@Component({
  selector: 'app-branding', // Cleaned up selector
  standalone: true,
  imports: [AdBannerComponent], // Add the ad component here
  templateUrl: './branding.component.html',
  styleUrl: './branding.component.scss',
})
export class BrandingComponent { }
