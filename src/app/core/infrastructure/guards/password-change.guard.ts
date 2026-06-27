import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';

/**
 * Protege `/auth/cambiar-password`: solo es alcanzable por una sesión activa que
 * aún tenga pendiente el cambio de contraseña temporal. Sin sesión va a `/login`;
 * si ya no se requiere el cambio, se devuelve al dashboard.
 */
export const passwordChangeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return auth.requierePasswordChange() ? true : router.createUrlTree(['/dashboard']);
};
