import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Venta } from '../../domain/models';
import { environment } from '../../../../environments/environment';
import { CatalogoService } from './catalogo.service';

/** Datos necesarios para registrar una venta; el id y el estado los asigna el servicio. */
export type NuevaVenta = Omit<Venta, 'id' | 'estado'>;

/**
 * Repositorio del punto de venta y del historial de ventas. Consume el backend
 * REST (json-server) vía HttpClient y coordina el inventario a través de
 * {@link CatalogoService}.
 */
@Injectable({ providedIn: 'root' })
export class PosService {
  private readonly http = inject(HttpClient);
  private readonly catalogo = inject(CatalogoService);
  private readonly apiUrl = `${environment.apiUrl}/ventas`;

  private readonly _ventas = signal<Venta[]>([]);

  readonly ventas: Signal<readonly Venta[]> = this._ventas.asReadonly();

  /** Recaudación total de las ventas no anuladas. */
  readonly totalRecaudado = computed(() =>
    this._ventas()
      .filter((v) => v.estado === 'completada')
      .reduce((acc, v) => acc + v.total, 0),
  );

  constructor() {
    this.cargar();
  }

  /** Carga inicial desde el backend. */
  private cargar(): void {
    this.http.get<Venta[]>(this.apiUrl).subscribe((vs) => this._ventas.set(vs));
  }

  getById(id: string): Venta | undefined {
    return this._ventas().find((v) => v.id === id);
  }

  /**
   * Registra una venta (POST). Al confirmarse la antepone al Signal y descuenta
   * el stock vendido en el backend a través del CatalogoService.
   */
  registrarVenta(nueva: NuevaVenta): Observable<Venta> {
    const venta: Venta = {
      ...nueva,
      id: `v${this._ventas().length + 1}`,
      estado: 'completada',
    };
    return this.http.post<Venta>(this.apiUrl, venta).pipe(
      tap((creada) => {
        this._ventas.update((ventas) => [creada, ...ventas]);
        creada.items.forEach((item) => this.catalogo.descontarStock(item.productoId, item.cantidad));
      }),
    );
  }

  /** Anula una venta (PATCH) y repone el stock de sus ítems al confirmarse. */
  anularVenta(id: string, motivo: string): Observable<Venta | null> {
    const venta = this.getById(id);
    if (!venta || venta.estado === 'anulada') return of(null);

    return this.http
      .patch<Venta>(`${this.apiUrl}/${id}`, { estado: 'anulada', motivoAnulacion: motivo })
      .pipe(
        tap(() => {
          this._ventas.update((ventas) =>
            ventas.map((v) =>
              v.id === id ? { ...v, estado: 'anulada', motivoAnulacion: motivo } : v,
            ),
          );
          venta.items.forEach((item) => this.catalogo.restaurarStock(item.productoId, item.cantidad));
        }),
      );
  }
}
