/** Métodos de pago aceptados. */
export const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Yape', 'Plin'] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

/** Estados posibles de una venta. */
export const ESTADOS_VENTA = ['completada', 'anulada'] as const;
export type EstadoVenta = (typeof ESTADOS_VENTA)[number];

/** Línea de una venta. */
export interface VentaItem {
  productoId: string;
  /** Nombre del producto al momento de la venta (snapshot). */
  nombre: string;
  cantidad: number;
  /** Precio unitario aplicado en la venta. */
  precio: number;
}

/** Comprobante de venta del punto de venta (POS). */
export interface Venta {
  readonly id: string;
  /** Fecha-hora ISO 8601 de emisión. */
  fecha: string;
  clienteId: string;
  items: VentaItem[];
  /** Total en soles (PEN). */
  total: number;
  metodoPago: MetodoPago;
  estado: EstadoVenta;
  vendedor: string;
  /** Presente solo cuando `estado === 'anulada'`. */
  motivoAnulacion?: string;
}
