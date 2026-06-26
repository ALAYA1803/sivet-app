import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ResumenMetodoPago } from '../../../core/domain/models';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';

interface DonutSegment {
  color: string;
  dash: number;
  gap: number;
  offset: number;
}

/** Gráfico de dona con la distribución de ingresos por método de pago. */
@Component({
  selector: 'app-pagos-donut',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SolesPipe],
  template: `
    <div class="flex items-center gap-6">
      <div class="relative">
        <svg width="160" height="160" viewBox="0 0 160 160" class="-rotate-90">
          <circle
            cx="80"
            cy="80"
            [attr.r]="radius"
            fill="none"
            stroke="currentColor"
            stroke-width="20"
            class="text-slate-100 dark:text-slate-700/40"
          />
          @for (s of segments; track $index) {
            <circle
              cx="80"
              cy="80"
              [attr.r]="radius"
              fill="none"
              [attr.stroke]="s.color"
              stroke-width="20"
              [attr.stroke-dasharray]="s.dash + ' ' + s.gap"
              [attr.stroke-dashoffset]="-s.offset"
            />
          }
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-[10px] uppercase tracking-wide text-slate-500">Total</div>
          <div class="text-lg font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {{ total | soles }}
          </div>
        </div>
      </div>
      <div class="flex-1 space-y-2.5">
        @for (d of data; track d.metodo) {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-2.5 h-2.5 rounded-sm" [style.background]="d.color"></div>
              <span class="text-sm text-slate-700 dark:text-slate-300">{{ d.metodo }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {{ d.monto | soles }}
              </div>
              <div class="text-[11px] text-slate-500 tabular-nums">{{ d.porcentaje }}%</div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class PagosDonutComponent {
  @Input({ required: true }) data: readonly ResumenMetodoPago[] = [];
  readonly radius = 60;
  private readonly circ = 2 * Math.PI * 60;

  get total(): number {
    return this.data.reduce((s, d) => s + d.monto, 0);
  }

  get segments(): DonutSegment[] {
    const total = this.total || 1;
    let offset = 0;
    return this.data.map((d) => {
      const dash = this.circ * (d.monto / total);
      const seg: DonutSegment = { color: d.color, dash, gap: this.circ - dash, offset };
      offset += dash;
      return seg;
    });
  }
}
