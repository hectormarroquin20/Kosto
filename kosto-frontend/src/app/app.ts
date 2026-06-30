import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';

// Importaciones de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar'; // <-- Resuelve el error de mat-toolbar
import { MatButtonModule } from '@angular/material/button';   // <-- Resuelve el error si usas mat-button
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatMenuModule } from '@angular/material/menu';
import { Tenant } from './core/services/tenant';
import { Auth } from './core/services/auth';

import { TranslateService } from '@ngx-translate/core';


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
    MatMenuModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private document = inject(DOCUMENT);
  private tenantService = inject(Tenant);
  private readonly authService = inject(Auth);
  private translate = inject(TranslateService);

  public isDarkMode = false;
  public companyName = 'Kosto Inventory System'; // Valor por defecto
  public tenantId: string | null = null;
  title = 'kosto-saas';

  ngOnInit(): void {
    this.tenantId = this.authService.getTenantId();
    // 1. Restaurar tema
    const savedTheme = localStorage.getItem('isDarkMode');
    this.isDarkMode = savedTheme === 'true';
    if (this.isDarkMode) {
      this.document.body.classList.add('dark-theme');
    }

    // 2. Cargar nombre de empresa
    this.tenantService.getTenantbyId(this.tenantId).subscribe({
      next: (res: any) => {
        // Asegúrate de acceder a company_name según la estructura de tu respuesta
        this.companyName = res.company_name || res.data?.company_name || 'Kosto SaaS';
      },
      error: () => console.log("No se pudo cargar el nombre de la empresa")
    });

    this.translate.addLangs(['es', 'en']);
    this.translate.setFallbackLang('es');
    this.translate.use(localStorage.getItem('lang') || 'es');
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('isDarkMode', String(this.isDarkMode)); // <-- PERSISTENCIA

    if (this.isDarkMode) {
      this.document.body.classList.add('dark-theme');
    } else {
      this.document.body.classList.remove('dark-theme');
    }
  }
}
