import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { tenantInterceptor } from './core/infrastructure/interceptors/tenant.interceptor';
import { AuthService } from './core/application/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Cliente HTTP con el interceptor multi-tenant ya registrado: inyecta
    // Authorization + X-Tenant-ID en cada petición.
    provideHttpClient(withInterceptors([tenantInterceptor])),
    // Rehidrata la sesión (token + tenant) ANTES de activar el Router. El token
    // ya se lee de forma síncrona del localStorage, así que el interceptor lo
    // adjunta en el GET /clinicas/{id}. Si ese GET devuelve 401/403, la sesión
    // se limpia y el authGuard redirige a /login: nunca queda el dashboard roto.
    provideAppInitializer(() => inject(AuthService).initialize()),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
