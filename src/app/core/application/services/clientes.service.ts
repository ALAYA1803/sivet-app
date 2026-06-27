import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cliente } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/**
 * Repositorio de clientes/dueños. Consume el backend REST (json-server) vía
 * HttpClient y expone los datos a los componentes a través de Signals.
 */
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  private readonly _clientes = signal<Cliente[]>([]);

  /** Lista reactiva de clientes (solo lectura). */
  readonly clientes: Signal<readonly Cliente[]> = this._clientes.asReadonly();

  /** Total de clientes registrados. */
  readonly total = computed(() => this._clientes().length);

  constructor() {
    this.cargar();
  }

  /** Carga inicial desde el backend. */
  private cargar(): void {
    this.http.get<Cliente[]>(this.apiUrl).subscribe((clientes) => this._clientes.set(clientes));
  }

  getById(id: string): Cliente | undefined {
    return this._clientes().find((c) => c.id === id);
  }

  /**
   * Registra un nuevo cliente: hace POST al backend y, al confirmarse, lo
   * antepone al Signal local. Devuelve el cliente creado (con su id).
   */
  agregarCliente(datos: Omit<Cliente, 'id'>): Observable<Cliente> {
    const cliente: Cliente = { ...datos, id: `c${this._clientes().length + 1}` };
    return this.http
      .post<Cliente>(this.apiUrl, cliente)
      .pipe(tap((creado) => this._clientes.update((cs) => [creado, ...cs])));
  }
}
