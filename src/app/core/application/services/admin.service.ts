import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Clinica, Credenciales } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/**
 * Cuerpo **plano** del alta combinada clínica + usuario administrador. El
 * backend espera un único objeto sin anidar (datos de la clínica + del doctor).
 */
export interface OnboardingRequest {
  nombre: string;
  ruc: string;
  sede: string;
  telefono: string;
  email: string;
  direccion: string;
  doctorNombre: string;
  doctorUsername: string;
}

/**
 * Servicio del panel maestro (SUPERADMIN). Opera sobre `/admin-sivet/**`, rutas
 * por encima de cualquier tenant (sin `X-Tenant-ID`).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin-sivet`;

  /** Listado de clínicas dadas de alta en la plataforma. */
  listarClinicas(): Observable<Clinica[]> {
    return this.http.get<Clinica[]>(`${this.apiUrl}/clinicas`);
  }

  /**
   * Da de alta una clínica junto a su usuario administrador en una sola
   * operación. Devuelve las credenciales (incluida la contraseña temporal).
   */
  registrarClinicaOnboarding(payload: OnboardingRequest): Observable<Credenciales> {
    return this.http.post<Credenciales>(`${this.apiUrl}/clinicas-onboarding`, payload);
  }
}
