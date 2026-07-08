import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';

// Importaciones de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar'; // <-- Resolves the error of mat-toolbar
import { MatButtonModule } from '@angular/material/button';   // <-- Resolves the error if you use mat-button
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

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
  private document = inject(DOCUMENT);
  private tenantService = inject(TenantService); // Already there
  private readonly authService = inject(IAuthService); // Injects the facade
  private translate = inject(TranslateService);
  private router = inject(Router);
  public modalService = inject(SubscriptionModalService);
  public adService = inject(AdService)

  public isDarkMode = false;
  public companyName = 'Kosto Inventory System';
  public tenantId: string | null = null;

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
          error: () => console.log("No se pudo cargar el nombre de la empresa")
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
  }

  // 👇 RESTORED METHODS 👇

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
    // 1. Direct gateway to Cognito
    this.authService.logout();

    // ==============================================================
    // ORIGINAL LOGIC COMMENTED OUT (BACKUP)
    // ==============================================================
    // if (this.router) {
    //   await this.router.navigate(['/login']);
    //   window.location.reload();
    // } else {
    //   console.error("The Router is not initialized");
    // }
  }

  onLoginSuccess() {
    this.router.navigate(['/']);
  }
}

