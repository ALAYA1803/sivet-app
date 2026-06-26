import { Injectable, Signal, computed, signal } from '@angular/core';
import { Atencion, Mascota, Receta, RecetaItem } from '../../domain/models';
import {
  ATENCIONES_MOCK,
  MASCOTAS_MOCK,
  RECETAS_MOCK,
} from '../../infrastructure/mock/sivet-mock-data';

/**
 * Repositorio temporal del módulo clínico: pacientes (mascotas),
 * su historia clínica (atenciones) y las recetas emitidas.
 */
@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly _mascotas = signal<Mascota[]>(MASCOTAS_MOCK);
  private readonly _atenciones = signal<Atencion[]>(ATENCIONES_MOCK);
  private readonly _recetas = signal<Receta[]>(RECETAS_MOCK);

  readonly mascotas: Signal<readonly Mascota[]> = this._mascotas.asReadonly();
  readonly atenciones: Signal<readonly Atencion[]> = this._atenciones.asReadonly();
  readonly recetas: Signal<readonly Receta[]> = this._recetas.asReadonly();

  readonly total = computed(() => this._mascotas().length);

  getMascota(id: string): Mascota | undefined {
    return this._mascotas().find((m) => m.id === id);
  }

  /** Registra una nueva mascota (le asigna el id) y la antepone a la lista. */
  agregarMascota(datos: Omit<Mascota, 'id'>): Mascota {
    const mascota: Mascota = { ...datos, id: `m${this._mascotas().length + 1}` };
    this._mascotas.update((ms) => [mascota, ...ms]);
    return mascota;
  }

  /** Mascotas pertenecientes a un cliente. */
  getMascotasByCliente(clienteId: string): Mascota[] {
    return this._mascotas().filter((m) => m.clienteId === clienteId);
  }

  /** Historia clínica de una mascota, ordenada de más reciente a más antigua. */
  getHistoria(mascotaId: string): Atencion[] {
    return this._atenciones()
      .filter((a) => a.mascotaId === mascotaId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  getReceta(id: string): Receta | undefined {
    return this._recetas().find((r) => r.id === id);
  }

  /**
   * Registra una nueva atención (y su receta opcional) en la historia clínica.
   * La atención es inalterable una vez creada.
   */
  registrarAtencion(
    atencion: Omit<Atencion, 'id' | 'recetaId'>,
    recetaItems: RecetaItem[] = [],
  ): Atencion {
    const id = `a${this._atenciones().length + 1}`;
    let recetaId: string | undefined;

    if (recetaItems.length > 0) {
      recetaId = `r${this._recetas().length + 1}`;
      const receta: Receta = { id: recetaId, atencionId: id, items: recetaItems };
      this._recetas.update((rs) => [...rs, receta]);
    }

    const nueva: Atencion = { ...atencion, id, recetaId };
    this._atenciones.update((list) => [nueva, ...list]);
    return nueva;
  }
}
