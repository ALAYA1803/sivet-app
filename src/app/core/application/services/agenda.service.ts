import { Injectable, Signal, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cita } from '../../domain/models';
import { environment } from '../../../../environments/environment';

/** Datos necesarios para crear una cita; el id y el estado los asigna el servicio. */
export type NuevaCita = Omit<Cita, 'id' | 'estado'>;

/**
 * Repositorio de la agenda de citas. Consume el backend REST (Spring Boot) vía
 * HttpClient y expone las citas como Signals.
 */
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/citas`;

  /** Franjas horarias disponibles (bloques de 30 min). */
  readonly horarios: readonly string[] = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
  ];

  private readonly _citas = signal<Cita[]>([]);

  /** Lista reactiva de citas (solo lectura). */
  readonly citas: Signal<readonly Cita[]> = this._citas.asReadonly();

  constructor() {
    this.cargar();
  }

  /** Carga inicial desde el backend. */
  private cargar(): void {
    this.http.get<Cita[]>(this.apiUrl).subscribe((cs) => this._citas.set(cs));
  }

  /** Horas ya ocupadas (no canceladas) en una fecha dada. */
  horasOcupadas(fecha: string): string[] {
    return this._citas()
      .filter((c) => c.fecha === fecha && c.estado !== 'cancelada')
      .map((c) => c.hora);
  }

  /**
   * Registra una nueva cita (POST) y la agrega al Signal al confirmarse.
   * El backend asigna el `id` (UUID) y fija `estado = 'pendiente'`, por lo que
   * el cliente solo envía los datos de la franja.
   */
  agregarCita(datos: NuevaCita): Observable<Cita> {
    return this.http
      .post<Cita>(this.apiUrl, datos)
      .pipe(tap((creada) => this._citas.update((cs) => [...cs, creada])));
  }

  /** Cambia el estado de una cita (PATCH) y refleja el cambio en el Signal. */
  cambiarEstado(id: string, estado: Cita['estado']): void {
    this.http
      .patch<Cita>(`${this.apiUrl}/${id}`, { estado })
      .subscribe(() => this._citas.update((cs) => cs.map((c) => (c.id === id ? { ...c, estado } : c))));
  }
}
