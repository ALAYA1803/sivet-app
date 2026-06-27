import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogoService } from '../../core/application/services/catalogo.service';
import { DashboardService } from '../../core/application/services/dashboard.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { PosService } from '../../core/application/services/pos.service';
import { TenantService } from '../../core/application/services/tenant.service';
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
  private readonly pacientes = inject(PacientesService);
  private readonly pos = inject(PosService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);

  readonly flujoPacientes = this.dashboard.flujoPacientes;
  readonly metodosPago = this.dashboard.metodosPago;

  /** Identidad del usuario y la clínica activos (del login, no en duro). */
  readonly doctorNombre = computed(() => this.tenant.tenant().doctorNombre);
  readonly clinicaNombre = computed(() => this.tenant.tenant().clinicaNombre);
  readonly sede = computed(() => this.tenant.tenant().sede);

  /**
   * Día de referencia ("hoy"): la fecha de actividad más reciente del dataset
   * (ventas + atenciones). Ancla los cálculos a los datos reales del backend
   * en lugar de a una fecha escrita en duro.
   */
  private readonly hoy = computed(() => {
    const fechas = [
      ...this.pos.ventas().map((v) => new Date(v.fecha).getTime()),
      ...this.pacientes.atenciones().map((a) => new Date(a.fecha).getTime()),
    ];
    return fechas.length ? new Date(Math.max(...fechas)) : new Date();
  });

  /** Saludo según la hora real del reloj. */
  readonly saludo = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  });

  /** Fecha de referencia formateada en español. */
  readonly fechaHoy = computed(() =>
    new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.hoy()),
  );

  /** Pacientes únicos atendidos en el día de referencia. */
  readonly pacientesHoy = computed(() => {
    const ids = new Set(
      this.pacientes
        .atenciones()
        .filter((a) => this.esMismoDia(a.fecha))
        .map((a) => a.mascotaId),
    );
    return ids.size;
  });

  readonly ventasHoy = computed(() =>
    this.pos.ventas().filter((v) => v.estado === 'completada' && this.esMismoDia(v.fecha)),
  );

  readonly ingresosHoy = computed(() =>
    this.ventasHoy().reduce((sum, v) => sum + v.total, 0),
  );

  readonly citas = computed<CitaVista[]>(() =>
    this.dashboard.citasHoy().map((c) => ({
      ...c,
      // Especie inferida desde la colección real de mascotas (por nombre).
      especie: this.pacientes.mascotas().find((m) => m.nombre === c.mascota)?.especie ?? 'Canino',
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

  /** ¿La fecha ISO cae en el día de referencia ("hoy")? */
  private esMismoDia(iso: string): boolean {
    return new Date(iso).toDateString() === this.hoy().toDateString();
  }

  /** Ancho de la barra de stock, tope 100%. */
  barWidth(pct: number): number {
    return Math.min(pct, 100);
  }
}
