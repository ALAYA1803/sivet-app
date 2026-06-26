import { Injectable, Signal, computed, signal } from '@angular/core';
import { Producto } from '../../domain/models';
import { PRODUCTOS_MOCK } from '../../infrastructure/mock/sivet-mock-data';

/**
 * Repositorio temporal del catálogo (productos y servicios) e inventario.
 * Centraliza las mutaciones de stock para que el POS las reutilice.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly _productos = signal<Producto[]>(PRODUCTOS_MOCK);

  readonly productos: Signal<readonly Producto[]> = this._productos.asReadonly();

  /** Productos con inventario por debajo (o igual) de su mínimo. */
  readonly stockCriticos = computed(() =>
    this._productos().filter((p) => p.stock !== null && p.stockMin !== null && p.stock <= p.stockMin),
  );

  getById(id: string): Producto | undefined {
    return this._productos().find((p) => p.id === id);
  }

  /** Registra un nuevo producto (le asigna el id) y lo antepone a la lista. */
  agregarProducto(datos: Omit<Producto, 'id'>): Producto {
    const producto: Producto = { ...datos, id: `p${this._productos().length + 1}` };
    this._productos.update((ps) => [producto, ...ps]);
    return producto;
  }

  /** Actualiza los datos de un producto existente. */
  actualizarProducto(id: string, datos: Omit<Producto, 'id'>): void {
    this._productos.update((ps) => ps.map((p) => (p.id === id ? { ...datos, id } : p)));
  }

  /** Descuenta `cantidad` del stock (ignora servicios sin inventario). */
  descontarStock(productoId: string, cantidad: number): void {
    this._productos.update((productos) =>
      productos.map((p) =>
        p.id === productoId && p.stock !== null
          ? { ...p, stock: Math.max(0, p.stock - cantidad) }
          : p,
      ),
    );
  }

  /** Repone `cantidad` al stock (p. ej. al anular una venta). */
  restaurarStock(productoId: string, cantidad: number): void {
    this._productos.update((productos) =>
      productos.map((p) =>
        p.id === productoId && p.stock !== null ? { ...p, stock: p.stock + cantidad } : p,
      ),
    );
  }
}
