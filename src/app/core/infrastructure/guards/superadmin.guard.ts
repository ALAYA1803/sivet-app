import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';

/**
 * Protege el panel maestro (`/backoffice`): solo accesible con sesión activa y
 * rol `SUPERADMIN`. Sin sesión redirige a `/login`; con otro rol, al dashboard.
 */
export const superAdminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  return auth.isSuperAdmin() ? true : router.createUrlTree(['/dashboard']);
};
