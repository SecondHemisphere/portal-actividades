import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';

import localeEs from '@angular/common/locales/es';
import localeEsEC from '@angular/common/locales/es-EC';
import { registerLocaleData } from '@angular/common';
import { AuthInterceptor } from './interceptors/auth.interceptor';

registerLocaleData(localeEs, 'es');
registerLocaleData(localeEsEC, 'es-EC');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-EC'
    }
  ]
};

