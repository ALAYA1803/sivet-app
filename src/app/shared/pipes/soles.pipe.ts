import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un monto en soles peruanos: 124 → "S/ 124.00".
 * Equivalente a `fmtSoles` del prototipo.
 */
@Pipe({ name: 'soles', standalone: true })
export class SolesPipe implements PipeTransform {
  transform(value: number): string {
    return (
      'S/ ' +
      value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  }
}
