import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, tap } from 'rxjs';
import { Atencion, Estudio, Mascota, Receta, RecetaItem } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/**
 * Repositorio del módulo clínico: pacientes (mascotas), su historia clínica
 * (atenciones) y las recetas emitidas. Consume el backend REST (json-server)
 * vía HttpClient y expone los datos como Signals.
 */
@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly mascotasUrl = `${environment.apiUrl}/mascotas`;
  private readonly atencionesUrl = `${environment.apiUrl}/atenciones`;
  private readonly recetasUrl = `${environment.apiUrl}/recetas`;
  private readonly estudiosUrl = `${environment.apiUrl}/estudios`;

  private readonly _mascotas = signal<Mascota[]>([]);
  private readonly _atenciones = signal<Atencion[]>([]);
  private readonly _recetas = signal<Receta[]>([]);
  private readonly _estudios = signal<Estudio[]>([]);

  readonly mascotas: Signal<readonly Mascota[]> = this._mascotas.asReadonly();
  readonly atenciones: Signal<readonly Atencion[]> = this._atenciones.asReadonly();
  readonly recetas: Signal<readonly Receta[]> = this._recetas.asReadonly();
  readonly estudios: Signal<readonly Estudio[]> = this._estudios.asReadonly();

  readonly total = computed(() => this._mascotas().length);

  constructor() {
    this.cargar();
  }

  /** Carga inicial de mascotas, atenciones y recetas desde el backend. */
  private cargar(): void {
    this.http.get<Mascota[]>(this.mascotasUrl).subscribe((ms) => this._mascotas.set(ms));
    this.http.get<Atencion[]>(this.atencionesUrl).subscribe((as) => this._atenciones.set(as));
    this.http.get<Receta[]>(this.recetasUrl).subscribe((rs) => this._recetas.set(rs));
    this.http.get<Estudio[]>(this.estudiosUrl).subscribe((es) => this._estudios.set(es));
  }

  /** Estudios complementarios de una mascota. */
  getEstudios(mascotaId: string): Estudio[] {
    return this._estudios().filter((e) => e.mascotaId === mascotaId);
  }

  getMascota(id: string): Mascota | undefined {
    return this._mascotas().find((m) => m.id === id);
  }

  /** Registra una nueva mascota (POST) y la antepone a la lista al confirmarse. */
  agregarMascota(datos: Omit<Mascota, 'id'>): Observable<Mascota> {
    const mascota: Mascota = { ...datos, id: `m${this._mascotas().length + 1}` };
    return this.http
      .post<Mascota>(this.mascotasUrl, mascota)
      .pipe(tap((creada) => this._mascotas.update((ms) => [creada, ...ms])));
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
   * Si hay receta, primero la crea (POST /recetas) y luego la atención
   * (POST /atenciones) referenciándola. La atención es inalterable una vez creada.
   */
  registrarAtencion(
    atencion: Omit<Atencion, 'id' | 'recetaId'>,
    recetaItems: RecetaItem[] = [],
  ): Observable<Atencion> {
    const id = `a${this._atenciones().length + 1}`;

    if (recetaItems.length > 0) {
      const recetaId = `r${this._recetas().length + 1}`;
      const receta: Receta = { id: recetaId, atencionId: id, items: recetaItems };
      return this.http.post<Receta>(this.recetasUrl, receta).pipe(
        tap((creada) => this._recetas.update((rs) => [...rs, creada])),
        switchMap(() => this.postAtencion({ ...atencion, id, recetaId })),
      );
    }

    return this.postAtencion({ ...atencion, id });
  }

  /** POST de la atención + inserción optimista en el Signal local. */
  private postAtencion(nueva: Atencion): Observable<Atencion> {
    return this.http
      .post<Atencion>(this.atencionesUrl, nueva)
      .pipe(tap((creada) => this._atenciones.update((list) => [creada, ...list])));
  }
}
