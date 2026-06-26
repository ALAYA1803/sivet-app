/** Especies atendidas por la veterinaria. */
export const ESPECIES = ['Canino', 'Felino', 'Otros'] as const;
export type Especie = (typeof ESPECIES)[number];

/** Sexo de la mascota: M = macho, H = hembra. */
export const SEXOS = ['M', 'H'] as const;
export type Sexo = (typeof SEXOS)[number];

/** Paciente de la clínica. Pertenece a un {@link Cliente} vía `clienteId`. */
export interface Mascota {
  readonly id: string;
  nombre: string;
  especie: Especie;
  raza: string;
  sexo: Sexo;
  /** Edad expresada de forma legible, p. ej. "3 años". */
  edad: string;
  /** Peso en kilogramos. */
  peso: number;
  color: string;
  clienteId: string;
  /** URL de la foto o `null` si no tiene. */
  foto: string | null;
  esterilizada: boolean;
  /** Código de microchip; opcional, no todas las mascotas lo tienen. */
  microchip?: string;
}
