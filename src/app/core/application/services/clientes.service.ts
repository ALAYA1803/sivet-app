import { Injectable, Signal, computed, signal } from '@angular/core';
import { Cliente } from '../../domain/models';
import { CLIENTES_MOCK } from '../../infrastructure/mock/sivet-mock-data';

/**
 * Repositorio temporal de clientes/dueños.
 * Hoy sirve datos mock vía Signals; mañana hará llamadas HTTP al backend
 * sin cambiar su API pública.
 */
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly _clientes = signal<Cliente[]>(CLIENTES_MOCK);

  /** Lista reactiva de clientes (solo lectura). */
  readonly clientes: Signal<readonly Cliente[]> = this._clientes.asReadonly();

  /** Total de clientes registrados. */
  readonly total = computed(() => this._clientes().length);

  getById(id: string): Cliente | undefined {
    return this._clientes().find((c) => c.id === id);
  }

  /** Registra un nuevo cliente (le asigna el id) y lo antepone a la lista. */
  agregarCliente(datos: Omit<Cliente, 'id'>): Cliente {
    const cliente: Cliente = { ...datos, id: `c${this._clientes().length + 1}` };
    this._clientes.update((cs) => [cliente, ...cs]);
    return cliente;
  }
}
