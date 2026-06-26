import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Venta } from '../../domain/models';
import { VENTAS_MOCK } from '../../infrastructure/mock/sivet-mock-data';
import { CatalogoService } from './catalogo.service';

/** Datos necesarios para registrar una venta; el id y el estado los asigna el servicio. */
export type NuevaVenta = Omit<Venta, 'id' | 'estado'>;

/**
 * Repositorio temporal del punto de venta y del historial de ventas.
 * Coordina el inventario a través de {@link CatalogoService}.
 */
@Injectable({ providedIn: 'root' })
export class PosService {
  private readonly catalogo = inject(CatalogoService);
  private readonly _ventas = signal<Venta[]>(VENTAS_MOCK);

  readonly ventas: Signal<readonly Venta[]> = this._ventas.asReadonly();

  /** Recaudación total de las ventas no anuladas. */
  readonly totalRecaudado = computed(() =>
    this._ventas()
      .filter((v) => v.estado === 'completada')
      .reduce((acc, v) => acc + v.total, 0),
  );

  getById(id: string): Venta | undefined {
    return this._ventas().find((v) => v.id === id);
  }

  /** Registra una venta nueva (la antepone) y descuenta el stock vendido. */
  registrarVenta(nueva: NuevaVenta): Venta {
    const venta: Venta = {
      ...nueva,
      id: `v${this._ventas().length + 1}`,
      estado: 'completada',
    };
    this._ventas.update((ventas) => [venta, ...ventas]);
    venta.items.forEach((item) => this.catalogo.descontarStock(item.productoId, item.cantidad));
    return venta;
  }

  /** Anula una venta y repone el stock de sus ítems. */
  anularVenta(id: string, motivo: string): void {
    const venta = this.getById(id);
    if (!venta || venta.estado === 'anulada') return;

    this._ventas.update((ventas) =>
      ventas.map((v) =>
        v.id === id ? { ...v, estado: 'anulada', motivoAnulacion: motivo } : v,
      ),
    );
    venta.items.forEach((item) => this.catalogo.restaurarStock(item.productoId, item.cantidad));
  }
}
