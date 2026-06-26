/** Estados posibles de una cita de la agenda. */
export const ESTADOS_CITA = ['pendiente', 'completada', 'cancelada'] as const;
export type EstadoCita = (typeof ESTADOS_CITA)[number];

/** Cita agendada para un paciente. */
export interface Cita {
  readonly id: string;
  mascotaId: string;
  clienteId: string;
  /** Fecha en formato ISO "YYYY-MM-DD". */
  fecha: string;
  /** Hora de inicio en formato "HH:mm" (bloques de 30 min). */
  hora: string;
  motivo: string;
  estado: EstadoCita;
}
