import { Injectable, Signal, signal } from '@angular/core';
import { CitaHoy, FlujoPaciente, ResumenMetodoPago } from '../../domain/models';
import {
  CITAS_HOY_MOCK,
  FLUJO_PACIENTES_MOCK,
  METODOS_PAGO_RESUMEN_MOCK,
} from '../../infrastructure/mock/sivet-mock-data';

/**
 * Repositorio temporal de los datos agregados del dashboard
 * (read models: flujo de pacientes, recaudación por método de pago, citas del día).
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly _flujoPacientes = signal<FlujoPaciente[]>(FLUJO_PACIENTES_MOCK);
  private readonly _metodosPago = signal<ResumenMetodoPago[]>(METODOS_PAGO_RESUMEN_MOCK);
  private readonly _citasHoy = signal<CitaHoy[]>(CITAS_HOY_MOCK);

  readonly flujoPacientes: Signal<readonly FlujoPaciente[]> = this._flujoPacientes.asReadonly();
  readonly metodosPago: Signal<readonly ResumenMetodoPago[]> = this._metodosPago.asReadonly();
  readonly citasHoy: Signal<readonly CitaHoy[]> = this._citasHoy.asReadonly();
}
