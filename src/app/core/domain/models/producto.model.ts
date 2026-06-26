/** Categorías del catálogo (productos físicos y servicios). */
export const CATEGORIAS_PRODUCTO = [
  'Medicamento',
  'Antiparasitario',
  'Antiinflamatorio',
  'Vacuna',
  'Alimento',
  'Accesorio',
  'Servicio',
] as const;
export type CategoriaProducto = (typeof CATEGORIAS_PRODUCTO)[number];

/**
 * Ítem vendible del catálogo.
 * Los servicios (categoría "Servicio") no manejan inventario:
 * en ese caso `stock` y `stockMin` son `null`.
 */
export interface Producto {
  readonly id: string;
  codigo: string;
  nombre: string;
  categoria: CategoriaProducto;
  /** Precio unitario en soles (PEN). */
  precio: number;
  /** Existencias actuales; `null` para servicios sin inventario. */
  stock: number | null;
  /** Umbral mínimo antes de alertar; `null` para servicios. */
  stockMin: number | null;
  unidad: string;
}
