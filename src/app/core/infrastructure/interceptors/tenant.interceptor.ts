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
 * Si no hay sesión activa la petición pasa sin tocar (p. ej. el propio login,
 * que es la ruta pública que obtiene el token).
 */
/**
 * Rutas exentas del header `X-Tenant-ID`: `/auth/**` y `/clinicas/**` (§1.2) y
 * `/admin-sivet/**` (panel SUPERADMIN, que opera por encima de cualquier tenant).
 */
const TENANT_EXEMPT = /\/(auth|clinicas|admin-sivet)(\/|$)/;

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const veterinariaId = auth.veterinariaId();

  // Sin token no tocamos la petición (p. ej. el propio login).
  if (!token) {
    return next(req);
  }

  const setHeaders: Record<string, string> = { Authorization: `Bearer ${token}` };
  // El tenant solo viaja en rutas de negocio y solo si la sesión tiene clínica
  // (el SUPERADMIN no la tiene).
  if (veterinariaId && !TENANT_EXEMPT.test(req.url)) {
    setHeaders['X-Tenant-ID'] = veterinariaId;
  }

  return next(req.clone({ setHeaders }));
};
