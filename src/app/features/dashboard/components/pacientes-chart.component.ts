import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { FlujoPaciente } from '../../../core/domain/models';

/** Gráfico de barras del flujo de pacientes de los últimos 7 días. */
@Component({
  selector: 'app-pacientes-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-56">
      <div
        class="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 pointer-events-none"
      >
        @for (v of yAxis; track $index) {
          <div class="flex items-center gap-2">
            <span class="w-6 text-right">{{ v }}</span>
            <div class="flex-1 border-t border-dashed border-slate-200 dark:border-slate-700/50"></div>
          </div>
        }
      </div>
      <div class="absolute inset-0 pl-8 flex items-end justify-between gap-2">
        @for (d of data; track d.dia; let i = $index) {
          <div
            class="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
            (mouseenter)="hover.set(i)"
            (mouseleave)="hover.set(null)"
          >
            <div class="relative w-full flex flex-col items-center">
              @if (hover() === i) {
                <div
                  class="absolute -top-9 bg-slate-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap font-medium"
                >
                  {{ d.total }} pacientes
                </div>
              }
              <div
                class="w-full rounded-t-md transition-all duration-300"
                [class]="
                  isToday(i)
                    ? 'bg-[var(--primary)]'
                    : 'bg-[var(--primary-200)] group-hover:bg-[var(--primary-300)]'
                "
                [style.height.px]="(d.total / max) * 100 * 1.8"
              ></div>
            </div>
            <div
              class="text-xs"
              [class]="isToday(i) ? 'font-semibold text-slate-900 dark:text-slate-200' : 'text-slate-500'"
            >
              {{ d.dia }}
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class PacientesChartComponent {
  @Input({ required: true }) data: readonly FlujoPaciente[] = [];
  readonly hover = signal<number | null>(null);

  get max(): number {
    return Math.max(...this.data.map((d) => d.total), 1);
  }

  get yAxis(): number[] {
    const m = this.max;
    return [m, Math.round(m * 0.66), Math.round(m * 0.33), 0];
  }

  isToday(i: number): boolean {
    return i === this.data.length - 1;
  }
}
