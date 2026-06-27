import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Atencion, Estudio, Mascota, Receta, RecetaItem } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/** Cuerpo del POST /atenciones en modo "receta embebida" (creación atómica). */
type NuevaAtencion = Omit<Atencion, 'id' | 'recetaId'> & {
  receta?: { items: RecetaItem[] };
};

/**
 * Repositorio del módulo clínico: pacientes (mascotas), su historia clínica
 * (atenciones) y las recetas emitidas. Consume el backend REST (Spring Boot)
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

  /**
   * Registra una nueva mascota (POST) y la antepone a la lista al confirmarse.
   * El `id` (UUID) y el `clinica_id` los asigna el backend.
   */
  agregarMascota(datos: Omit<Mascota, 'id'>): Observable<Mascota> {
    return this.http
      .post<Mascota>(this.mascotasUrl, datos)
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
   * Usa el modo "receta embebida" de `POST /atenciones`: si hay ítems, viajan en
   * el campo `receta` y el backend crea atención + receta de forma atómica (§5.4).
   * El backend asigna todos los UUID; la atención es inalterable una vez creada.
   */
  registrarAtencion(
    atencion: Omit<Atencion, 'id' | 'recetaId'>,
    recetaItems: RecetaItem[] = [],
  ): Observable<Atencion> {
    const body: NuevaAtencion =
      recetaItems.length > 0 ? { ...atencion, receta: { items: recetaItems } } : { ...atencion };

    return this.http
      .post<Atencion>(this.atencionesUrl, body)
      .pipe(tap((creada) => this._atenciones.update((list) => [creada, ...list])));
  }
}
