import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../application/services/auth.service';

/**
 * Interceptor multi-tenant de SIVET.
 *
 * Clona cada petición saliente e inyecta dos cabeceras a partir del estado
 * de sesión (Signals del {@link AuthService}):
 *
 *  - `Authorization: Bearer <token>` — autenticación.
 *  - `X-Tenant-ID: <veterinaria_id>` — aislamiento de datos por veterinaria.
 *
 * Si no hay sesión activa la petición pasa sin tocar (p. ej. el propio login).
 * Aún no hacemos llamadas HTTP reales: queda registrado para que la
 * arquitectura esté lista en cuanto exista el backend.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const veterinariaId = auth.veterinariaId();

  if (!token || !veterinariaId) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-Tenant-ID': veterinariaId,
    },
  });

  return next(authReq);
};
