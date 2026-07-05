import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';

// Importaciones de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar'; // <-- Resuelve el error de mat-toolbar
import { MatButtonModule } from '@angular/material/button';   // <-- Resuelve el error si usas mat-button
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MatMenuModule } from '@angular/material/menu';
import { TenantService } from './core/services/tenant.service';
import { IAuthService } from '../../../kosto-frontend/src/app/core/models/auth.interface';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [
//     RouterOutlet,
//     RouterLink,
//     MatToolbarModule,
//     MatSidenavModule,
//     MatListModule,
//     MatIconModule,
//     MatButtonModule,
//     MatMenuModule,
//     TranslatePipe
//   ],
//   templateUrl: './app.html',
//   styleUrl: './app.scss'
// })
// export class App implements OnInit {
//   private document = inject(DOCUMENT);
//   private tenantService = inject(Tenant);
//   private readonly authService = inject(Auth);
//   private translate = inject(TranslateService);
//   private router = inject(Router);

//   public isDarkMode = false;
//   public companyName = 'Kosto Inventory System'; // Valor por defecto
//   public tenantId: string | null = null;

//   // isLoggedIn: WritableSignal<boolean> = signal(this.authService.isLoggedIn());
//   isLoggedIn = computed(() => this.authService.isLoggedIn());

//   ngOnInit(): void {
//     this.tenantId = this.authService.getTenantId();
//     // 1. Restaurar tema
//     const savedTheme = localStorage.getItem('isDarkMode');
//     this.isDarkMode = savedTheme === 'true';
//     if (this.isDarkMode) {
//       this.document.body.classList.add('dark-theme');
//     }

//     // 2. Cargar nombre de empresa
//     this.tenantService.getTenantbyId(this.tenantId).subscribe({
//       next: (res: any) => {
//         // Asegúrate de acceder a company_name según la estructura de tu respuesta
//         this.companyName = res.company_name || res.data?.company_name || 'Kosto SaaS';
//       },
//       error: () => console.log("No se pudo cargar el nombre de la empresa")
//     });

//     const savedLang = localStorage.getItem('lang') || 'es';
//     this.translate.use(savedLang);
//   }

//   changeLanguage(lang: string) {
//     this.translate.use(lang);
//     localStorage.setItem('lang', lang);
//   }

//   toggleTheme() {
//     this.isDarkMode = !this.isDarkMode;
//     localStorage.setItem('isDarkMode', String(this.isDarkMode)); // <-- PERSISTENCIA

//     if (this.isDarkMode) {
//       this.document.body.classList.add('dark-theme');
//     } else {
//       this.document.body.classList.remove('dark-theme');
//     }
//   }

//   async signOut() {
//     this.authService.logout();

//     // 3. Usa el router correctamente
//     if (this.router) {
//       await this.router.navigate(['/login']);
//       window.location.reload();
//     } else {
//       console.error("El Router no está inicializado");
//     }
//   }

//   onLoginSuccess() {
//     this.router.navigate(['/']);
//   }
// }

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
    TranslatePipe
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private document = inject(DOCUMENT);
  private tenantService = inject(TenantService);
  private readonly authService = inject(IAuthService); // Inyectamos la fachada
  private translate = inject(TranslateService);
  private router = inject(Router);

  public isDarkMode = false;
  public companyName = 'Kosto Inventory System';
  public tenantId: string | null = null;

  isLoggedIn = computed(() => this.authService.isLoggedIn());

  ngOnInit(): void {
    // Como usamos APP_INITIALIZER en app.config.ts, la sesión ya está verificada al llegar aquí.
    if (this.isLoggedIn()) {
      this.tenantId = this.authService.getTenantId();

      if (this.tenantId) {
        this.tenantService.getTenantbyId(this.tenantId).subscribe({
          next: (res: any) => {
            this.companyName = res.company_name || res.data?.company_name || 'Kosto SaaS';
          },
          error: () => console.log("No se pudo cargar el nombre de la empresa")
        });
      }
    }

    // 1. Restaurar tema
    const savedTheme = localStorage.getItem('isDarkMode');
    this.isDarkMode = savedTheme === 'true';
    if (this.isDarkMode) {
      this.document.body.classList.add('dark-theme');
    }

    // 2. Restaurar idioma
    const savedLang = localStorage.getItem('lang') || 'es';
    this.translate.use(savedLang);
  }

  // 👇 MÉTODOS RESTAURADOS 👇

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
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

  async signOut() {
    // 1. Gateway directo a Cognito
    this.authService.logout();

    // ==============================================================
    // LÓGICA ORIGINAL COMENTADA (RESPALDO)
    // ==============================================================
    // if (this.router) {
    //   await this.router.navigate(['/login']);
    //   window.location.reload();
    // } else {
    //   console.error("El Router no está inicializado");
    // }
  }

  onLoginSuccess() {
    this.router.navigate(['/']);
  }
}