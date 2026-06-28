import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CitaHoy, FlujoPaciente, ResumenMetodoPago } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/**
 * Repositorio de los datos agregados del dashboard (read models: flujo de
 * pacientes, recaudación por método de pago, citas del día). Consume el
 * backend REST (Spring Boot) vía HttpClient y expone los datos como Signals.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  private readonly _flujoPacientes = signal<FlujoPaciente[]>([]);
  private readonly _metodosPago = signal<ResumenMetodoPago[]>([]);
  private readonly _citasHoy = signal<CitaHoy[]>([]);
  private readonly _unidadesVendidasHoy = signal(0);

  readonly flujoPacientes: Signal<readonly FlujoPaciente[]> = this._flujoPacientes.asReadonly();
  readonly metodosPago: Signal<readonly ResumenMetodoPago[]> = this._metodosPago.asReadonly();
  readonly citasHoy: Signal<readonly CitaHoy[]> = this._citasHoy.asReadonly();
  /** Unidades de producto vendidas en el día (KPI del catálogo). */
  readonly unidadesVendidasHoy: Signal<number> = this._unidadesVendidasHoy.asReadonly();

  constructor() {
    this.cargar();
  }

  /**
   * Refresca los read models del dashboard desde el backend. Se invoca tras
   * crear una cita o una atención (para que las gráficas y la lista de citas se
   * actualicen sin recargar la página) o al cambiar el rango de fechas.
   *
   * @param rango Rango de fechas opcional ('hoy' | 'semana' | 'mes'). Se envía
   *   como query param para que el backend filtre; si no lo soporta, se ignora
   *   y el dashboard aplica el filtrado localmente.
   */
  recargar(rango?: string): void {
    this.cargar(rango);
  }

  /** Carga los read models del dashboard desde el backend. */
  private cargar(rango?: string): void {
    const base = environment.apiUrl;
    const qs = rango ? `?rango=${encodeURIComponent(rango)}` : '';
    this.http
      .get<FlujoPaciente[]>(`${base}/flujoPacientes${qs}`)
      .subscribe((fp) => this._flujoPacientes.set(fp));
    this.http
      .get<ResumenMetodoPago[]>(`${base}/metodosPago${qs}`)
      .subscribe((mp) => this._metodosPago.set(mp));
    this.http.get<CitaHoy[]>(`${base}/citasHoy${qs}`).subscribe((ch) => this._citasHoy.set(ch));
    this.http
      .get<{ unidades: number }>(`${base}/vendidosHoy${qs}`)
      .subscribe((v) => this._unidadesVendidasHoy.set(v?.unidades ?? 0));
  }
}
