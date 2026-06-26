import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../../../shared/ui/card.component';
import { BadgeComponent } from '../../../../shared/ui/badge.component';
import { IconComponent } from '../../../../shared/icons/icon.component';

interface Estudio {
  titulo: string;
  tag: string;
}

@Component({
  selector: 'app-estudios-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, IconComponent],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (e of estudios; track e.titulo) {
        <app-card padding="none" class="overflow-hidden">
          <div
            class="h-44 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative"
          >
            <app-icon name="image" [size]="36" class="text-slate-400" />
            <div class="absolute top-2 right-2"><app-badge tone="info">{{ e.tag }}</app-badge></div>
          </div>
          <div class="p-4">
            <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ e.titulo }}</div>
            <div class="text-xs text-slate-500 mt-1">26 mayo 2026 · Dra. Espinoza</div>
          </div>
        </app-card>
      }
      <button
        type="button"
        class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 p-8 text-slate-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
      >
        <app-icon name="plus" [size]="28" />
        <span class="text-sm font-medium">Subir estudio</span>
      </button>
    </div>
  `,
})
export class EstudiosTabComponent {
  readonly estudios: Estudio[] = [
    { titulo: 'Radiografía cadera', tag: 'RX' },
    { titulo: 'Hemograma completo', tag: 'LAB' },
    { titulo: 'Ecografía abdominal', tag: 'ECO' },
  ];
}
