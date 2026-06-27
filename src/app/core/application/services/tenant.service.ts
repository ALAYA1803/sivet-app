import { computed, Injectable, signal } from '@angular/core';

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
 * (db.json) al iniciar sesión. Sin login, no hay tenant.
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

  /** Vuelve al estado anónimo (al cerrar sesión). */
  reset(): void {
    this._tenant.set({ ...ANONYMOUS });
  }
}
