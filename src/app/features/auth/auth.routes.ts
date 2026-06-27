import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout.component';

/**
 * Rutas públicas de autenticación, bajo el {@link AuthLayoutComponent}
 * (pantalla dividida). El `publicGuard` que las protege se aplica en
 * `app.routes.ts` para redirigir al dashboard si ya hay sesión.
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
    ],
  },
];
