import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Producto } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/**
 * Repositorio del catálogo (productos y servicios) e inventario. Consume el
 * backend REST (Spring Boot) vía HttpClient.
 *
 * El stock vendido/restaurado lo gestiona el backend de forma transaccional al
 * crear/anular una venta (`POST`/`PATCH /ventas`); aquí solo reflejamos ese
 * cambio en el Signal local para que la UI quede sincronizada sin recargar.
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

  /**
   * Registra un nuevo producto (POST) y lo antepone a la lista al confirmarse.
   * El `id` (UUID) lo asigna el backend; el cliente solo envía los datos.
   */
  agregarProducto(datos: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http
      .post<Producto>(this.apiUrl, datos)
      .pipe(tap((creado) => this._productos.update((ps) => [creado, ...ps])));
  }

  /** Actualiza los datos de un producto existente (PUT /productos/{id}). */
  actualizarProducto(id: string, datos: Omit<Producto, 'id'>): Observable<Producto> {
    return this.http
      .put<Producto>(`${this.apiUrl}/${id}`, datos)
      .pipe(tap((upd) => this._productos.update((ps) => ps.map((p) => (p.id === id ? upd : p)))));
  }

  /**
   * Refleja localmente el stock descontado por una venta ya confirmada en el
   * backend. **No** hace HTTP: el descuento real lo realizó `POST /ventas` de
   * forma transaccional; aquí solo evitamos recargar todo el catálogo.
   */
  aplicarDescuentoLocal(productoId: string, cantidad: number): void {
    this.ajustarStockLocal(productoId, -cantidad);
  }

  /** Refleja localmente el stock restaurado al anular una venta (sin HTTP). */
  aplicarRestauracionLocal(productoId: string, cantidad: number): void {
    this.ajustarStockLocal(productoId, cantidad);
  }

  private ajustarStockLocal(productoId: string, delta: number): void {
    this._productos.update((ps) =>
      ps.map((p) =>
        p.id === productoId && p.stock !== null
          ? { ...p, stock: Math.max(0, p.stock + delta) }
          : p,
      ),
    );
  }
}
