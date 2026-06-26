import { Pipe, PipeTransform } from '@angular/core';

export type FechaFormato = 'corta' | 'larga' | 'hora' | 'diaMes' | 'diaMesAnio';

/**
 * Formatea fechas ISO con la misma salida `es-PE` del prototipo.
 * - corta:      "24 may. 2026"
 * - larga:      "24 de mayo de 2026"
 * - hora:       "10:30"
 * - diaMes:     "26 may."
 * - diaMesAnio: "24 may. 2026" (alias de corta para la tabla)
 */
@Pipe({ name: 'fecha', standalone: true })
export class FechaPipe implements PipeTransform {
  transform(value: string, formato: FechaFormato = 'corta'): string {
    const d = new Date(value);
    switch (formato) {
      case 'larga':
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
      case 'hora':
        return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      case 'diaMes':
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
      case 'corta':
      case 'diaMesAnio':
      default:
        return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }
}
