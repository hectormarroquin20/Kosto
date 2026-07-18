import { Component, computed, inject, OnInit, ViewChild, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';

// Angular Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';

import { MatMenuModule } from '@angular/material/menu';
import { TenantService } from './core/services/tenant.service';
import { IAuthService } from '../../../kosto-frontend/src/app/core/models/auth.interface';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

// New import
import { UpgradeModalComponent } from './components/upgrade-modal/upgrade-modal.component';
import { SubscriptionModalService } from './core/services/subscription-modal.service';
import { AdBannerComponent } from './components/ads/ads.component';
import { AdService } from './core/services/ad.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslatePipe,
    UpgradeModalComponent,
    AdBannerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private document = inject(DOCUMENT);
  private tenantService = inject(TenantService);
  private readonly authService = inject(IAuthService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  public modalService = inject(SubscriptionModalService);
  public adService = inject(AdService);
  private breakpointObserver = inject(BreakpointObserver);

  public isDarkMode = false;
  public companyName = 'Kosto Inventory System';
  public tenantId: string | null = null;
  public isMobile = signal(false);

  isLoggedIn = computed(() => this.authService.isLoggedIn());

  ngOnInit(): void {
    // Since we use APP_INITIALIZER in app.config.ts, the session is already verified when we reach here.
    if (this.isLoggedIn()) {
      this.tenantId = this.authService.getTenantId();

      if (this.tenantId) {
        this.tenantService.getTenantbyId(this.tenantId).subscribe({
          next: (res: any) => {
            const tenantData = res.data?.[0] || res; // Handles your array vs object response

            // 1. Update company name
            this.companyName = tenantData.company_name || 'Kosto SaaS';

            // 2. IMPORTANT: Update the central Tenant signal so AdService works!
            this.tenantService.tenant.set(tenantData);
          },
          error: () => console.log("Could not load company name")
        });
      }
    }

    // 1. Restore theme
    const savedTheme = localStorage.getItem('isDarkMode');
    this.isDarkMode = savedTheme === 'true';
    if (this.isDarkMode) {
      this.document.body.classList.add('dark-theme');
    }

    // 2. Restore language
    const savedLang = localStorage.getItem('lang') || 'es';
    this.translate.use(savedLang);

    // Responsive Sidebar Logic
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile.set(result.matches);
    });
  }

  // 👇 RESTORED METHODS 👇

  // Close sidenav on route change for mobile
  onNavItemClick() {
    if (window.innerWidth < 768) {
      this.sidenav.close();
    }
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', String(this.isDarkMode)); // <-- PERSISTENCE

    if (this.isDarkMode) {
      this.document.body.classList.add('dark-theme');
    } else {
      this.document.body.classList.remove('dark-theme');
    }
  }

  async signOut() {
    // Local cleanup
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to LOGOUT endpoint
    const cognitoDomain = 'https://us-east-1eazpdrljw.auth.us-east-1.amazoncognito.com';
    const clientId = '4m41ibsf6p1il704jiosr80m0p';
    const logoutUri = encodeURIComponent('https://app.insummi.com/login');

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
  }

  onLoginSuccess() {
    this.router.navigate(['/']);
  }
}

