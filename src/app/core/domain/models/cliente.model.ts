/** Dueño / propietario de una o más mascotas. */
export interface Cliente {
  readonly id: string;
  nombre: string;
  /** Documento Nacional de Identidad (8 dígitos en Perú). */
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
}
