import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogoService } from '../../core/application/services/catalogo.service';
import { DashboardService } from '../../core/application/services/dashboard.service';
import { PosService } from '../../core/application/services/pos.service';
import { Especie } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { PetAvatarComponent } from '../../shared/ui/pet-avatar.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { SolesPipe } from '../../shared/pipes/soles.pipe';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { PacientesChartComponent } from './components/pacientes-chart.component';
import { PagosDonutComponent } from './components/pagos-donut.component';

/** Cita del día enriquecida con la especie inferida (para el PetAvatar). */
interface CitaVista {
  hora: string;
  mascota: string;
  cliente: string;
  tipo: string;
  vet: string;
  especie: Especie;
}

/** Producto crítico con el porcentaje de stock ya calculado. */
interface StockCriticoVista {
  id: string;
  nombre: string;
  stock: number;
  stockMin: number;
  pct: number;
  critical: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    PetAvatarComponent,
    IconComponent,
    SolesPipe,
    KpiCardComponent,
    PacientesChartComponent,
    PagosDonutComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly dashboard = inject(DashboardService);
  private readonly catalogo = inject(CatalogoService);
  private readonly pos = inject(PosService);
  private readonly router = inject(Router);

  /** Pacientes atendidos hoy (constante en el prototipo). */
  readonly pacientesHoy = 11;

  readonly flujoPacientes = this.dashboard.flujoPacientes;
  readonly metodosPago = this.dashboard.metodosPago;

  readonly ventasHoy = computed(() =>
    this.pos
      .ventas()
      .filter((v) => v.fecha.startsWith('2026-05-26') && v.estado === 'completada'),
  );

  readonly ingresosHoy = computed(() =>
    this.ventasHoy().reduce((sum, v) => sum + v.total, 0),
  );

  readonly citas = computed<CitaVista[]>(() =>
    this.dashboard.citasHoy().map((c) => ({
      ...c,
      especie: c.mascota === 'Nala' || c.mascota === 'Pelusa' ? 'Felino' : 'Canino',
    })),
  );

  readonly proximaCita = computed(() => {
    const c = this.citas()[0];
    return c ? `Próxima: ${c.hora} — ${c.mascota}` : 'Sin citas pendientes';
  });

  readonly stockCriticos = computed<StockCriticoVista[]>(() =>
    this.catalogo.stockCriticos().map((p) => {
      const stock = p.stock ?? 0;
      const stockMin = p.stockMin ?? 0;
      const pct = stockMin > 0 ? (stock / stockMin) * 100 : 0;
      return { id: p.id, nombre: p.nombre, stock, stockMin, pct, critical: pct < 50 };
    }),
  );

  readonly totalCriticos = computed(() => this.catalogo.stockCriticos().length);

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  /** Ancho de la barra de stock, tope 100%. */
  barWidth(pct: number): number {
    return Math.min(pct, 100);
  }
}
