import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardComponent } from './card.component';
import { BadgeComponent, BadgeTone } from './badge.component';
import { IconComponent } from '../icons/icon.component';

/** Tarjeta de KPI reutilizable. El icono se proyecta con `[icon]`. */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, IconComponent],
  template: `
    <app-card>
      <div class="relative">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" [class]="iconBg">
            <ng-content select="[icon]" />
          </div>
          @if (delta) {
            <app-badge [tone]="deltaTone">
              <app-icon name="trend-up" [size]="12" [stroke]="2.4" />
              {{ delta }}
            </app-badge>
          }
        </div>
        <div class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {{ label }}
        </div>
        <div
          class="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight tabular-nums"
        >
          {{ value }}
        </div>
        @if (hint) {
          <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ hint }}</div>
        }
      </div>
    </app-card>
  `,
})
export class KpiCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() delta?: string;
  @Input() deltaTone: BadgeTone = 'success';
  @Input() iconBg = '';
  @Input() hint?: string;
}
