/** Línea de una receta médica. */
export interface RecetaItem {
  medicamento: string;
  dosis: string;
  via: string;
  duracion: string;
  indicaciones: string;
}

/** Receta asociada a una {@link Atencion} mediante `atencionId`. */
export interface Receta {
  readonly id: string;
  atencionId: string;
  items: RecetaItem[];
}
