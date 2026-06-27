import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../application/services/auth.service';

/**
 * Protege las rutas públicas (login / recuperar contraseña). Si el usuario
 * ya tiene sesión activa lo manda al dashboard en vez de mostrarle el login.
 */
export const publicGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  // Ya autenticado: lo enviamos a su destino real según estado y rol.
  if (auth.requierePasswordChange()) {
    return router.createUrlTree(['/auth/cambiar-password']);
  }
  if (auth.isSuperAdmin()) {
    return router.createUrlTree(['/backoffice']);
  }
  return router.createUrlTree(['/dashboard']);
};
