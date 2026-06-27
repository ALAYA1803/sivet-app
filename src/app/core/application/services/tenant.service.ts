import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Clinica } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/** Campos editables del perfil de la clínica (sin `id`, lo fija la URL/token). */
export type ClinicaUpdate = Omit<Clinica, 'id'>;

/** Datos de la sesión/arrendatario activo (una clínica del SaaS). */
export interface Tenant {
  clinicaNombre: string;
  /** Iniciales o etiqueta corta para sede/sucursal. */
  sede: string;
  doctorNombre: string;
  doctorRol: string;
  /** Tenant ID — identifica a la veterinaria para el aislamiento de datos. */
  veterinariaId: string;
  ruc: string;
  telefono: string;
  email: string;
  direccion: string;
}

/**
 * Estado por defecto: todo en blanco. SIVET no guarda ningún dato de clínica
 * "en duro"; el {@link AuthService} hidrata estos campos desde el backend
 * (`GET /clinicas/{id}`) al iniciar sesión. Sin login, no hay tenant.
 */
const ANONYMOUS: Tenant = {
  clinicaNombre: '',
  sede: '',
  doctorNombre: '',
  doctorRol: '',
  veterinariaId: '',
  ruc: '',
  telefono: '',
  email: '',
  direccion: '',
};

/**
 * Sesión multi-tenant de SIVET (SaaS). El {@link AuthService} lo hidrata con
 * los datos del usuario y de su clínica (traídos del backend) al iniciar
 * sesión, y lo resetea al cerrarla; el layout (sidebar/topbar/configuración)
 * sólo lo lee.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly clinicasUrl = `${environment.apiUrl}/clinicas`;

  private readonly _tenant = signal<Tenant>({ ...ANONYMOUS });

  /** Arrendatario activo (solo lectura). */
  readonly tenant = this._tenant.asReadonly();

  /** Tenant ID activo (atajo de lectura). */
  readonly veterinariaId = computed(() => this._tenant().veterinariaId);

  /** Marca de la plataforma mostrada bajo el nombre de la clínica. */
  readonly plataforma = 'Powered by SIVET';

  /** Fusiona datos de sesión (los del login) sobre el tenant actual. */
  hydrate(data: Partial<Tenant>): void {
    this._tenant.update((t) => ({ ...t, ...data }));
  }

  /**
   * Persiste los datos editables de la clínica activa
   * (`PATCH /clinicas/{veterinaria_id}`) y, al confirmarse, refleja la respuesta
   * en el tenant local. El `id` lo determina el token (es el propio tenant), por
   * lo que el cliente nunca lo envía en el cuerpo.
   */
  actualizarClinica(datos: ClinicaUpdate): Observable<Clinica> {
    const id = this.veterinariaId();
    return this.http.patch<Clinica>(`${this.clinicasUrl}/${id}`, datos).pipe(
      tap((clinica) =>
        this.hydrate({
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

  /** Vuelve al estado anónimo (al cerrar sesión). */
  reset(): void {
    this._tenant.set({ ...ANONYMOUS });
  }
}
