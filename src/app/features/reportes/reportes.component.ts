import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PosService } from '../../core/application/services/pos.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { ExportService } from '../../core/application/services/export.service';
import { METODOS_PAGO, MetodoPago, Venta } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { KpiCardComponent } from '../../shared/ui/kpi-card.component';
import { SolesPipe } from '../../shared/pipes/soles.pipe';

/** Rango temporal del reporte. */
type RangoTemporal = 'hoy' | 'semana' | 'mes';

interface RangoOption {
  value: RangoTemporal;
  label: string;
}

/** Recaudación agregada por método de pago. */
interface MetodoResumen {
  metodo: MetodoPago;
  total: number;
  pct: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ButtonComponent, IconComponent, KpiCardComponent, SolesPipe, DecimalPipe],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-7">
        <div>
          <h1 class="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Reportes
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">
            Métricas consolidadas de ventas y actividad clínica
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <!-- Filtro temporal segmentado -->
          <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            @for (r of rangos; track r.value) {
              <button
                type="button"
                (click)="rango.set(r.value)"
                class="px-3 h-8 text-xs font-medium rounded-md transition-colors"
                [class]="
                  rango() === r.value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                "
              >
                {{ r.label }}
              </button>
            }
          </div>
          <app-button variant="secondary" (clicked)="exportarExcel()">
            <app-icon icon name="file-text" [size]="16" />Exportar
          </app-button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <app-kpi-card
          label="Recaudación"
          [value]="totalRecaudado() | soles"
          iconBg="bg-emerald-50 dark:bg-emerald-500/15"
          [hint]="ventasCompletadas() + ' ventas · ' + rangoLabel()"
        >
          <app-icon icon name="money" [size]="20" class="text-emerald-700" />
        </app-kpi-card>

        <app-kpi-card
          label="Ticket promedio"
          [value]="ticketPromedio() | soles"
          iconBg="bg-sky-50 dark:bg-sky-500/15"
          hint="Por venta completada"
        >
          <app-icon icon name="receipt" [size]="20" class="text-sky-700" />
        </app-kpi-card>

        <app-kpi-card
          label="Pacientes"
          [value]="totalPacientes()"
          iconBg="bg-violet-50 dark:bg-violet-500/15"
          hint="Mascotas registradas"
        >
          <app-icon icon name="paw" [size]="20" class="text-violet-700" />
        </app-kpi-card>

        <app-kpi-card
          label="Atenciones"
          [value]="totalAtenciones()"
          iconBg="bg-amber-50 dark:bg-amber-500/15"
          hint="Registradas en historia clínica"
        >
          <app-icon icon name="stethoscope" [size]="20" class="text-amber-700" />
        </app-kpi-card>
      </div>

      <!-- Recaudación por método de pago -->
      <app-card>
        <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Recaudación por método de pago · {{ rangoLabel() }}
        </h2>
        @if (porMetodo().length === 0) {
          <p class="text-sm text-slate-400 py-6 text-center">
            No hay ventas registradas en este rango.
          </p>
        } @else {
          <div class="space-y-4">
            @for (m of porMetodo(); track m.metodo) {
              <div>
                <div class="flex items-center justify-between text-sm mb-1.5">
                  <span class="font-medium text-slate-700 dark:text-slate-200">{{ m.metodo }}</span>
                  <span class="tabular-nums text-slate-600 dark:text-slate-300">
                    {{ m.total | soles }} · {{ m.pct | number: '1.0-0' }}%
                  </span>
                </div>
                <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
                  <div class="h-full rounded-full bg-[var(--primary)]" [style.width.%]="m.pct"></div>
                </div>
              </div>
            }
          </div>
        }
      </app-card>
    </div>
  `,
})
export class ReportesComponent {
  private readonly pos = inject(PosService);
  private readonly pacientes = inject(PacientesService);
  private readonly exporter = inject(ExportService);

  readonly totalPacientes = this.pacientes.total;
  readonly totalAtenciones = computed(() => this.pacientes.atenciones().length);

  readonly rango = signal<RangoTemporal>('mes');
  readonly rangos: RangoOption[] = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
  ];

  readonly rangoLabel = computed(
    () => this.rangos.find((r) => r.value === this.rango())?.label ?? '',
  );

  /**
   * Fecha de referencia del reporte: la venta más reciente del dataset.
   * Ancla los rangos a los datos disponibles (mock) en lugar del reloj real.
   */
  private readonly referencia = computed(() => {
    const fechas = this.pos.ventas().map((v) => new Date(v.fecha).getTime());
    return fechas.length ? new Date(Math.max(...fechas)) : new Date();
  });

  /** Ventas completadas dentro del rango temporal seleccionado. */
  private readonly completadas = computed<Venta[]>(() => {
    const ref = this.referencia();
    const rango = this.rango();
    return this.pos.ventas().filter((v) => {
      if (v.estado !== 'completada') return false;
      const f = new Date(v.fecha);
      switch (rango) {
        case 'hoy':
          return f.toDateString() === ref.toDateString();
        case 'semana': {
          const inicio = new Date(ref);
          inicio.setDate(ref.getDate() - 6);
          inicio.setHours(0, 0, 0, 0);
          return f >= inicio && f <= ref;
        }
        case 'mes':
          return f.getFullYear() === ref.getFullYear() && f.getMonth() === ref.getMonth();
      }
    });
  });

  readonly totalRecaudado = computed(() =>
    this.completadas().reduce((s, v) => s + v.total, 0),
  );
  readonly ventasCompletadas = computed(() => this.completadas().length);
  readonly ticketPromedio = computed(() => {
    const n = this.completadas().length;
    return n > 0 ? this.totalRecaudado() / n : 0;
  });

  /** Recaudación desglosada por método de pago. */
  readonly porMetodo = computed<MetodoResumen[]>(() => {
    const total = this.totalRecaudado();
    return METODOS_PAGO.map((metodo) => {
      const acumulado = this.completadas()
        .filter((v) => v.metodoPago === metodo)
        .reduce((s, v) => s + v.total, 0);
      return {
        metodo,
        total: acumulado,
        pct: total > 0 ? (acumulado / total) * 100 : 0,
      };
    }).filter((m) => m.total > 0);
  });

  exportarExcel(): void {
    this.exporter.descargarReporteVentas({ rango: this.rango() });
  }
}
