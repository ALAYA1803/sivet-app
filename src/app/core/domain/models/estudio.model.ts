/**
 * Estudio o examen complementario adjunto a la historia clínica de una mascota
 * (radiografía, laboratorio, ecografía…). Persistido en la colección `estudios`.
 */
export interface Estudio {
  id: string;
  mascotaId: string;
  titulo: string;
  /** Etiqueta corta del tipo de estudio (RX, LAB, ECO…). */
  tag: string;
  fecha: string;
  veterinario: string;
}
