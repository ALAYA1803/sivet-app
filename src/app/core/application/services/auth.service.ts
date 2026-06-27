import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Clinica } from '../../domain/models';
import { environment } from '../../../../environments/environment';
import { TenantService } from './tenant.service';

/** Payload de un JWT decodificado de SIVET (claims de sesión). */
export interface SessionPayload {
  id_usuario: string;
  nombre: string;
  rol: string;
  /** Vacío/ausente para el SUPERADMIN, que no pertenece a ninguna clínica. */
  veterinaria_id: string;
  /** Algunos backends marcan el primer login dentro del propio payload. */
  requiereCambioPassword?: boolean;
}

/** Credenciales que envía el formulario de login. */
export interface LoginCredentials {
  credencial: string;
  password: string;
}

/** Resultado de un login devuelto por Spring Boot. */
export interface AuthSession {
  token: string;
  payload: SessionPayload;
  /** True en el primer inicio: obliga a cambiar la contraseña temporal. */
  requiereCambioPassword?: boolean;
}

const STORAGE_KEY = 'sivet.session';

/**
 * Servicio de autenticación core de SIVET.
 * * Se comunica mediante POST con el endpoint de Spring Security.
 * Almacena el JWT real y maneja la hidratación del Tenant.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);
  private readonly authUrl = `${environment.apiUrl}/auth/login`;
  private readonly clinicasUrl = `${environment.apiUrl}/clinicas`;

  private readonly _session = signal<AuthSession | null>(this.restore());

  readonly session = this._session.asReadonly();
  readonly user = computed(() => this._session()?.payload ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly veterinariaId = computed(() => this._session()?.payload.veterinaria_id ?? null);
  readonly token = computed(() => this._session()?.token ?? null);

  /** Rol maestro de la plataforma (acceso al backoffice). */
  readonly isSuperAdmin = computed(
    () => (this._session()?.payload.rol ?? '').toUpperCase() === 'SUPERADMIN',
  );

  /** Administrador de su clínica (puede gestionar el personal). */
  readonly isClinicAdmin = computed(
    () => (this._session()?.payload.rol ?? '').toUpperCase() === 'ADMIN_CLINICA',
  );

  /** True mientras el usuario deba cambiar su contraseña temporal (primer login). */
  readonly requierePasswordChange = computed(() => {
    const s = this._session();
    return !!(s?.requiereCambioPassword ?? s?.payload.requiereCambioPassword);
  });

  /**
   * Rehidratación de sesión al arrancar la app (se ejecuta vía APP_INITIALIZER,
   * **antes** de que el Router active cualquier ruta — ver `app.config.ts`).
   *
   * El token ya se recuperó de forma **síncrona** del `localStorage` en el
   * inicializador del signal `_session`, de modo que el `tenantInterceptor` ya
   * dispone de `Authorization` + `X-Tenant-ID` para esta primera petición.
   *
   * Flujo:
   *  1. Sin sesión persistida ⇒ completa de inmediato (mostrará el login).
   *  2. Con sesión ⇒ hidrata al doctor (síncrono) y pide `GET /clinicas/{id}`
   *     para rehidratar el tenant (nombre de clínica, RUC, sede…).
   *  3. Si esa petición devuelve **401/403** (token caducado/inválido), limpia
   *     la sesión: el `authGuard` redirigirá entonces a `/login` de forma limpia,
   *     evitando el dashboard "en blanco" tras un F5.
   *
   * Nunca emite error: el bootstrap de Angular siempre debe continuar.
   */
  initialize(): Observable<void> {
    const restored = this._session();
    if (!restored) {
      return of(void 0);
    }

    this.hydrateDoctor(restored.payload);

    // El SUPERADMIN no tiene clínica que rehidratar.
    if (!restored.payload.veterinaria_id) {
      return of(void 0);
    }

    return this.cargarClinica(restored.payload.veterinaria_id).pipe(
      map(() => void 0),
      catchError((error: unknown) => {
        // Solo invalidamos la sesión ante errores de autorización del backend;
        // un fallo de red transitorio no debería expulsar al usuario.
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
          this.logout();
        }
        return of(void 0);
      }),
    );
  }

  /**
   * Realiza un POST seguro al backend de Java.
   * Si Spring Security lo aprueba, devuelve el AuthSession.
   */
  login(credentials: LoginCredentials): Observable<AuthSession> {
    const body = {
      credencial: credentials.credencial.trim(),
      password: credentials.password
    };

    return this.http.post<AuthSession>(this.authUrl, body).pipe(
      switchMap((session) => {
        this.persist(session);
        this._session.set(session);
        this.hydrateDoctor(session.payload);
        // SUPERADMIN (o cuenta sin clínica): no hay tenant que cargar.
        if (!session.payload.veterinaria_id) {
          return of(session);
        }
        return this.cargarClinica(session.payload.veterinaria_id).pipe(
          // El login ya fue exitoso; si la rehidratación del tenant falla no
          // anulamos la sesión (se reintenta en el próximo arranque).
          catchError(() => of(null)),
          map(() => session),
        );
      }),
      catchError((error) => {
        console.error('Error de autenticación:', error);
        return throwError(() => new Error('Usuario o contraseña incorrectos.'));
      })
    );
  }

  requestPasswordReset(credencial: string): Observable<void> {
    return of(void 0);
  }

  /**
   * Cambio obligatorio de la contraseña temporal en el primer inicio de sesión
   * (`POST /usuarios/cambiar-password-inicial`). Requiere sesión activa (el JWT
   * temporal). Al confirmarse, baja la bandera para liberar el acceso normal.
   */
  cambiarPasswordInicial(nuevaPassword: string): Observable<void> {
    return this.http
      .post<unknown>(`${environment.apiUrl}/usuarios/cambiar-password-inicial`, { nuevaPassword })
      .pipe(
        tap(() => {
          const actual = this._session();
          if (!actual) return;
          const actualizado: AuthSession = {
            ...actual,
            requiereCambioPassword: false,
            payload: { ...actual.payload, requiereCambioPassword: false },
          };
          this.persist(actualizado);
          this._session.set(actualizado);
        }),
        map(() => void 0),
      );
  }

  logout(): void {
    this._session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.tenantService.reset();
  }

  /**
   * Rehidrata los datos del tenant desde `GET /clinicas/{id}`.
   * **No** captura el error a propósito: cada llamador decide qué hacer
   * (el login lo ignora; `initialize()` lo usa para detectar 401/403).
   */
  private cargarClinica(clinicaId: string): Observable<Clinica> {
    return this.http.get<Clinica>(`${this.clinicasUrl}/${clinicaId}`).pipe(
      tap((clinica) =>
        this.tenantService.hydrate({
          clinicaNombre: clinica.nombre,
          sede: clinica.sede,
          ruc: clinica.ruc,
          telefono: clinica.telefono,
          email: clinica.email,
          direccion: clinica.direccion,
        }),
      ),
    );
  }

  private hydrateDoctor(payload: SessionPayload): void {
    this.tenantService.hydrate({
      doctorNombre: payload.nombre,
      doctorRol: payload.rol,
      veterinariaId: payload.veterinaria_id,
    });
  }

  private persist(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage no disponible */
    }
  }

  private restore(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      // Basta con token + payload: el SUPERADMIN no tiene `veterinaria_id`.
      return parsed?.token && parsed?.payload ? parsed : null;
    } catch {
      return null;
    }
  }
}
