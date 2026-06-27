import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CitaHoy, FlujoPaciente, ResumenMetodoPago } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/**
 * Repositorio de los datos agregados del dashboard (read models: flujo de
 * pacientes, recaudación por método de pago, citas del día). Consume el
 * backend REST (json-server) vía HttpClient y expone los datos como Signals.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly _flujoPacientes = signal<FlujoPaciente[]>([]);
  private readonly _metodosPago = signal<ResumenMetodoPago[]>([]);
  private readonly _citasHoy = signal<CitaHoy[]>([]);

  readonly flujoPacientes: Signal<readonly FlujoPaciente[]> = this._flujoPacientes.asReadonly();
  readonly metodosPago: Signal<readonly ResumenMetodoPago[]> = this._metodosPago.asReadonly();
  readonly citasHoy: Signal<readonly CitaHoy[]> = this._citasHoy.asReadonly();

  constructor() {
    this.cargar();
  }

  /** Carga inicial de los read models del dashboard desde el backend. */
  private cargar(): void {
    const base = environment.apiUrl;
    this.http
      .get<FlujoPaciente[]>(`${base}/flujoPacientes`)
      .subscribe((fp) => this._flujoPacientes.set(fp));
    this.http.get<ResumenMetodoPago[]>(`${base}/metodosPago`).subscribe((mp) => this._metodosPago.set(mp));
    this.http.get<CitaHoy[]>(`${base}/citasHoy`).subscribe((ch) => this._citasHoy.set(ch));
  }
}
