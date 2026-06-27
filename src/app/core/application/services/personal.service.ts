import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Credenciales, Empleado } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/** Cuerpo de alta de un empleado de la clínica (rol Veterinario/Recepcionista). */
export interface NuevoEmpleado {
  nombre: string;
  username: string;
  rol: string;
}

/**
 * Gestión del personal de la clínica (rol ADMIN_CLINICA). Opera sobre rutas de
 * tenant (`/usuarios/empleados`), por lo que el interceptor adjunta `X-Tenant-ID`
 * automáticamente y el backend acota el personal a la clínica del token.
 */
@Injectable({ providedIn: 'root' })
export class PersonalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios/empleados`;

  /** Empleados de la clínica activa. */
  listarEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  /**
   * Da de alta un empleado y devuelve sus credenciales temporales para que el
   * administrador se las entregue manualmente.
   */
  registrarEmpleado(datos: NuevoEmpleado): Observable<Credenciales> {
    return this.http.post<Credenciales>(this.apiUrl, datos);
  }
}
