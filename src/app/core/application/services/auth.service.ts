import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Clinica, Usuario } from '../../domain/models';
import { environment } from '../../../../environments/environment';
import { TenantService } from './tenant.service';

/**
 * Payload de un JWT decodificado de SIVET (claims de sesión).
 * El backend firmará un token con exactamente estos campos; aquí lo simulamos.
 */
export interface SessionPayload {
  id_usuario: string;
  nombre: string;
  rol: string;
  /** Tenant ID — aísla los datos por veterinaria (multi-arrendatario). */
  veterinaria_id: string;
}

/** Credenciales que envía el formulario de login. */
export interface LoginCredentials {
  credencial: string;
  password: string;
}

/** Resultado de un login: el token firmado + su payload ya decodificado. */
export interface AuthSession {
  token: string;
  payload: SessionPayload;
}

const STORAGE_KEY = 'sivet.session';

/**
 * Servicio de autenticación core de SIVET (SaaS multi-tenant).
 *
 * El login es real: consulta la colección `usuarios` del backend (json-server)
 * y, si hay coincidencia, carga la `clinica` asociada para hidratar el tenant.
 * No hay credenciales ni datos de clínica "en duro" en el frontend. El estado
 * de sesión vive en un Signal y se persiste en `localStorage` para sobrevivir
 * a recargas.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TenantService);
  private readonly usuariosUrl = `${environment.apiUrl}/usuarios`;
  private readonly clinicasUrl = `${environment.apiUrl}/clinicas`;

  private readonly _session = signal<AuthSession | null>(this.restore());

  /** Sesión activa (token + payload) o `null` si no hay nadie logueado. */
  readonly session = this._session.asReadonly();

  /** Payload del usuario autenticado (claims) o `null`. */
  readonly user = computed(() => this._session()?.payload ?? null);

  /** `true` si existe una sesión válida. Lo usan los guards. */
  readonly isAuthenticated = computed(() => this._session() !== null);

  /** Tenant ID activo — lo inyecta el interceptor en `X-Tenant-ID`. */
  readonly veterinariaId = computed(() => this._session()?.payload.veterinaria_id ?? null);

  /** Token Bearer actual — lo inyecta el interceptor en `Authorization`. */
  readonly token = computed(() => this._session()?.token ?? null);

  constructor() {
    // Si veníamos de una sesión persistida, rehidrata el tenant: los datos del
    // doctor desde el payload y los de la clínica volviéndolos a pedir al backend.
    const restored = this._session();
    if (restored) {
      this.hydrateDoctor(restored.payload);
      this.cargarClinica(restored.payload.veterinaria_id).subscribe();
    }
  }

  /**
   * Login real contra el backend: busca el usuario por credenciales en
   * `/usuarios` y, si existe, carga su clínica y genera la sesión. Si no hay
   * coincidencia, emite un error de credenciales inválidas.
   */
  login(credentials: LoginCredentials): Observable<AuthSession> {
    const params = new HttpParams()
      .set('username', credentials.credencial.trim())
      .set('password', credentials.password);

    return this.http.get<Usuario[]>(this.usuariosUrl, { params }).pipe(
      switchMap((usuarios) => {
        const usuario = usuarios[0];
        if (!usuario) {
          return throwError(() => new Error('Usuario o contraseña incorrectos.'));
        }

        const payload: SessionPayload = {
          id_usuario: usuario.id,
          nombre: usuario.nombre,
          rol: usuario.rol,
          veterinaria_id: usuario.clinica_id,
        };
        const session: AuthSession = { token: this.fakeJwt(payload), payload };

        this.persist(session);
        this._session.set(session);
        this.hydrateDoctor(payload);

        // Carga la clínica del usuario para completar el tenant antes de resolver.
        return this.cargarClinica(usuario.clinica_id).pipe(map(() => session));
      }),
    );
  }

  /**
   * Simula la solicitud de recuperación de contraseña. Siempre resuelve
   * "ok" (no se revela si el correo existe) tras una breve latencia.
   */
  requestPasswordReset(credencial: string): Observable<void> {
    return of(void 0);
  }

  /** Cierra la sesión: limpia el Signal, el storage y el tenant. */
  logout(): void {
    this._session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.tenantService.reset();
  }

  // ---- Internos ---------------------------------------------------------

  /** Trae la clínica (tenant) del backend e hidrata sus datos en el tenant. */
  private cargarClinica(clinicaId: string): Observable<Clinica | null> {
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

  /** Copia los claims del usuario (doctor) al TenantService que lee el layout. */
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
      /* storage no disponible — la sesión sigue viva en memoria */
    }
  }

  private restore(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      return parsed?.payload?.veterinaria_id ? parsed : null;
    } catch {
      return null;
    }
  }

  /**
   * Construye un JWT simulado (`header.payload.signature`) con el payload
   * codificado en base64url. NO está firmado de verdad — es sólo para que
   * el interceptor tenga un Bearer realista que enviar.
   */
  private fakeJwt(payload: SessionPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const body = { ...payload, iat: now, exp: now + 60 * 60 * 8 };
    const enc = (obj: unknown) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${enc(header)}.${enc(body)}.sivet-mock-signature`;
  }
}
