import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';

/**
 * Protege las rutas privadas (todo el bloque del MainLayout). Si no hay
 * sesión activa redirige a `/login`, guardando la URL solicitada en
 * `returnUrl` para volver tras autenticarse.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    // Primer login: hasta cambiar la contraseña temporal no se accede a nada más.
    if (auth.requierePasswordChange()) {
      return router.createUrlTree(['/auth/cambiar-password']);
    }
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
