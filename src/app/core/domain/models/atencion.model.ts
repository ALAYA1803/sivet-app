/** Tipos de atención registrables en la historia clínica. */
export const TIPOS_ATENCION = [
  'Consulta general',
  'Vacunación',
  'Desparasitación',
  'Cirugía',
] as const;
export type TipoAtencion = (typeof TIPOS_ATENCION)[number];

/**
 * Registro inalterable de la historia clínica de una mascota.
 * Funciona como un evento de un timeline: una vez creado no se edita.
 */
export interface Atencion {
  readonly id: string;
  mascotaId: string;
  /** Fecha-hora ISO 8601, p. ej. "2026-05-24T10:30:00". */
  fecha: string;
  tipo: TipoAtencion;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  veterinario: string;
  /** Constantes vitales. */
  temperatura: number;
  frecCardiaca: number;
  frecRespiratoria: number;
  /** Receta emitida en esta atención, si corresponde. */
  recetaId?: string;
}
