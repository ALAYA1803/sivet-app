/** Formatea el id interno de venta para mostrar: "v1" → "V-001". */
export function formatVentaId(id: string): string {
  return id.toUpperCase().replace('V', 'V-00');
}
