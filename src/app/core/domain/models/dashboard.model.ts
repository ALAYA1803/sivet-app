import { MetodoPago } from './venta.model';

/** Read models del dashboard (datos agregados, no entidades editables). */

/** Conteo de pacientes atendidos en un día. */
export interface FlujoPaciente {
  /** Etiqueta corta del día, p. ej. "Mié 20". */
  dia: string;
  total: number;
}

/** Resumen de recaudación por método de pago. */
export interface ResumenMetodoPago {
  metodo: MetodoPago;
  /** Monto recaudado en soles (PEN). */
  monto: number;
  /** Color HEX para el gráfico. */
  color: string;
  /** Participación porcentual (0-100). */
  porcentaje: number;
}

/** Cita agendada para el día actual. */
export interface CitaHoy {
  /** Hora en formato "HH:mm". */
  hora: string;
  mascota: string;
  cliente: string;
  tipo: string;
  vet: string;
}
