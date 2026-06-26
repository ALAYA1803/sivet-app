import { Injectable, Signal, signal } from '@angular/core';
import { Cita } from '../../domain/models';

/** Datos necesarios para crear una cita; el id y el estado los asigna el servicio. */
export type NuevaCita = Omit<Cita, 'id' | 'estado'>;

/** Devuelve la fecha de hoy en formato ISO "YYYY-MM-DD" (zona local). */
function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Repositorio temporal de la agenda de citas.
 * Hoy gestiona datos mock vía Signals; mañana hará llamadas HTTP al backend
 * sin cambiar su API pública.
 */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  /** Franjas horarias disponibles (bloques de 30 min). */
  readonly horarios: readonly string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
  ];

  private readonly _citas = signal<Cita[]>([
    { id: 'cita1', mascotaId: 'm1', clienteId: 'c1', fecha: hoyISO(), hora: '09:30', motivo: 'Control post-operatorio', estado: 'pendiente' },
    { id: 'cita2', mascotaId: 'm3', clienteId: 'c2', fecha: hoyISO(), hora: '11:00', motivo: 'Vacunación triple felina', estado: 'pendiente' },
    { id: 'cita3', mascotaId: 'm4', clienteId: 'c3', fecha: hoyISO(), hora: '16:00', motivo: 'Consulta dermatológica', estado: 'pendiente' },
  ]);

  /** Lista reactiva de citas (solo lectura). */
  readonly citas: Signal<readonly Cita[]> = this._citas.asReadonly();

  /** Horas ya ocupadas (no canceladas) en una fecha dada. */
  horasOcupadas(fecha: string): string[] {
    return this._citas()
      .filter((c) => c.fecha === fecha && c.estado !== 'cancelada')
      .map((c) => c.hora);
  }

  /**
   * Registra una nueva cita (le asigna id y estado 'pendiente').
   *
   * NOTA: este es el punto de extensión para disparar webhooks de
   * notificación (WhatsApp/email) cuando exista backend — la firma
   * pública no cambiará.
   */
  agregarCita(datos: NuevaCita): Cita {
    const cita: Cita = { ...datos, id: `cita${this._citas().length + 1}`, estado: 'pendiente' };
    this._citas.update((cs) => [...cs, cita]);
    return cita;
  }

  cambiarEstado(id: string, estado: Cita['estado']): void {
    this._citas.update((cs) => cs.map((c) => (c.id === id ? { ...c, estado } : c)));
  }
}
