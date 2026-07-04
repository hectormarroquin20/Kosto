import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { provideAuth } from 'angular-auth-oidc-client';

import { IAuthService } from './core/models/auth.interface';
import { Auth } from './core/services/auth';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // 1. Mantenemos SOLO el HttpClient que tiene el interceptor
    provideHttpClient(withInterceptors([authInterceptor])),

    provideRouter(routes),

    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      fallbackLang: 'es'
    }),

    provideAuth({
      config: {
        authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_eAzPdrLjW',
        // redirectUrl: 'https://d84l1y8p4kdic.cloudfront.net',
        // postLogoutRedirectUri: 'https://d84l1y8p4kdic.cloudfront.net',
        redirectUrl: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        clientId: '4m41ibsf6p1il704jiosr80m0p',
        scope: 'email openid profile phone',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true
      },
    }),

    // 2. Tu interfaz que apunta a la implementación
    { provide: IAuthService, useClass: Auth },

    // 3. El inicializador moderno
    provideAppInitializer(() => {
      const authService = inject(IAuthService);
      // Al retornar el Observable, Angular pausa la carga de la app hasta que Cognito responda
      return authService.checkAuth();
    })
  ]
};
