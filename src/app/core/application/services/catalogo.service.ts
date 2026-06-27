import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Producto } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/**
 * Repositorio del catálogo (productos y servicios) e inventario. Consume el
 * backend REST (json-server) vía HttpClient y centraliza las mutaciones de
 * stock para que el POS las reutilice.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  private readonly _productos = signal<Producto[]>([]);

  readonly productos: Signal<readonly Producto[]> = this._productos.asReadonly();

  /** Productos con inventario por debajo (o igual) de su mínimo. */
  readonly stockCriticos = computed(() =>
    this._productos().filter((p) => p.stock !== null && p.stockMin !== null && p.stock <= p.stockMin),
  );

  constructor() {
    this.cargar();
  }

  /** Carga inicial desde el backend. */
  private cargar(): void {
    this.http.get<Producto[]>(this.apiUrl).subscribe((ps) => this._productos.set(ps));
  }

  getById(id: string): Producto | undefined {
    return this._productos().find((p) => p.id === id);
  }

  /** Registra un nuevo producto (POST) y lo antepone a la lista al confirmarse. */
  agregarProducto(datos: Omit<Producto, 'id'>): Observable<Producto> {
    const producto: Producto = { ...datos, id: `p${this._productos().length + 1}` };
    return this.http
      .post<Producto>(this.apiUrl, producto)
      .pipe(tap((creado) => this._productos.update((ps) => [creado, ...ps])));
  }

  /** Actualiza los datos de un producto existente (PUT). */
  actualizarProducto(id: string, datos: Omit<Producto, 'id'>): Observable<Producto> {
    const producto: Producto = { ...datos, id };
    return this.http
      .put<Producto>(`${this.apiUrl}/${id}`, producto)
      .pipe(tap((upd) => this._productos.update((ps) => ps.map((p) => (p.id === id ? upd : p)))));
  }

  /** Descuenta `cantidad` del stock vía PATCH (ignora servicios sin inventario). */
  descontarStock(productoId: string, cantidad: number): void {
    const producto = this.getById(productoId);
    if (!producto || producto.stock === null) return;
    const stock = Math.max(0, producto.stock - cantidad);
    this.patchStock(productoId, stock);
  }

  /** Repone `cantidad` al stock vía PATCH (p. ej. al anular una venta). */
  restaurarStock(productoId: string, cantidad: number): void {
    const producto = this.getById(productoId);
    if (!producto || producto.stock === null) return;
    this.patchStock(productoId, producto.stock + cantidad);
  }

  /** PATCH del stock en el backend + actualización del Signal local. */
  private patchStock(productoId: string, stock: number): void {
    this.http
      .patch<Producto>(`${this.apiUrl}/${productoId}`, { stock })
      .subscribe((upd) =>
        this._productos.update((ps) =>
          ps.map((p) => (p.id === productoId ? { ...p, stock: upd.stock } : p)),
        ),
      );
  }
}
