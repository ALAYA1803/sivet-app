import { Injectable, signal } from '@angular/core';

/** Datos de la sesión/arrendatario activo (una clínica del SaaS). */
export interface Tenant {
  clinicaNombre: string;
  /** Iniciales o etiqueta corta para sede/sucursal. */
  sede: string;
  doctorNombre: string;
  doctorRol: string;
}

/**
 * Simula la sesión multi-tenant de SIVET (SaaS).
 * Hoy sirve datos fijos vía Signals; mañana se hidratará desde el login
 * real / token JWT sin cambiar su API pública.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly _tenant = signal<Tenant>({
    clinicaNombre: 'Veterinaria Huellitas',
    sede: 'San Borja',
    doctorNombre: 'Dra. Espinoza',
    doctorRol: 'Admin · Veterinaria',
  });

  /** Arrendatario activo (solo lectura). */
  readonly tenant = this._tenant.asReadonly();

  /** Marca de la plataforma mostrada bajo el nombre de la clínica. */
  readonly plataforma = 'Powered by SIVET';
}
