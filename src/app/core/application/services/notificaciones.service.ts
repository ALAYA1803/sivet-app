import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { IconName } from '../../../shared/icons/icon.component';
import { CatalogoService } from './catalogo.service';
import { DashboardService } from './dashboard.service';

export type NotificacionTipo = 'warning' | 'info';

export interface Notificacion {
  readonly id: string;
  tipo: NotificacionTipo;
  icono: IconName;
  titulo: string;
  mensaje: string;
  tiempo: string;
  route?: string;
}

/**
 * Construye las alertas de la app (stock bajo, citas próximas) a partir de los
 * servicios de dominio y lleva el control de cuáles ya fueron leídas.
 */
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly catalogo = inject(CatalogoService);
  private readonly dashboard = inject(DashboardService);

  private readonly _leidas = signal<string[]>([]);

  readonly notificaciones: Signal<Notificacion[]> = computed(() => {
    const stock: Notificacion[] = this.catalogo
      .stockCriticos()
      .slice(0, 5)
      .map((p) => ({
        id: `stock-${p.id}`,
        tipo: 'warning',
        icono: 'alert-triangle',
        titulo: `Stock crítico: ${p.nombre}`,
        mensaje: `Quedan ${p.stock} ${p.unidad} · mínimo ${p.stockMin}`,
        tiempo: 'hace 15 min',
        route: '/catalogo',
      }));

    const citas: Notificacion[] = this.dashboard
      .citasHoy()
      .slice(0, 2)
      .map((c, i) => ({
        id: `cita-${i}`,
        tipo: 'info',
        icono: 'calendar',
        titulo: `Próxima cita ${c.hora}`,
        mensaje: `${c.mascota} · ${c.tipo} · ${c.vet}`,
        tiempo: 'hoy',
        route: '/pacientes',
      }));

    return [...stock, ...citas];
  });

  readonly noLeidas = computed(() =>
    this.notificaciones().filter((n) => !this._leidas().includes(n.id)),
  );
  readonly cantidadNoLeidas = computed(() => this.noLeidas().length);

  marcarTodasLeidas(): void {
    this._leidas.set(this.notificaciones().map((n) => n.id));
  }
}
