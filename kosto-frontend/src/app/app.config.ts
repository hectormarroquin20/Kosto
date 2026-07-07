import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // Import your original auth interceptor
import { subscriptionInterceptor } from './core/interceptors/subscription.interceptor';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { provideAuth } from 'angular-auth-oidc-client';

import { IAuthService } from './core/models/auth.interface';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // 1. We keep ONLY the HttpClient with the interceptor
    provideHttpClient(
      withInterceptors([
        authInterceptor,         // 1. First, add the tenant/auth header
        subscriptionInterceptor  // 2. Then, handle the 403 limit checks
      ])
    ),
    provideRouter(routes),

    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' }),
      fallbackLang: 'es'
    }),

    provideAuth({
      config: {
        authority: environment.authority,
        redirectUrl: environment.redirectUrl,
        postLogoutRedirectUri: environment.postLogoutRedirectUri,
        clientId: '4m41ibsf6p1il704jiosr80m0p',
        scope: 'email openid profile phone',
        responseType: 'code',
        silentRenew: true,
        useRefreshToken: true
      },
    }),

    // 2. Your interface pointing to the implementation
    { provide: IAuthService, useClass: AuthService },

    // 3. The modern initializer
    provideAppInitializer(() => {
      const authService = inject(IAuthService);
      // Returning the Observable will pause the app loading until Cognito responds
      return authService.checkAuth();
    })
  ]
};

