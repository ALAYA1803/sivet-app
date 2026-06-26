import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icons/icon.component';

/**
 * Marcador temporal para las vistas aún no migradas.
 * Se reemplazará por los componentes reales de cada módulo.
 */
@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="p-8 max-w-[1600px] mx-auto">
      <div
        class="flex flex-col items-center justify-center text-center py-20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-[var(--primary-50)] text-[var(--primary-700)] flex items-center justify-center mb-4"
        >
          <app-icon [name]="icon" [size]="32" />
        </div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h2>
        <p class="text-sm text-slate-500 mt-1 max-w-md">
          Vista pendiente de migración. El layout ya inyecta este contenido vía router-outlet.
        </p>
      </div>
    </div>
  `,
})
export class PlaceholderPageComponent {
  @Input() title = 'Módulo';
  @Input() icon: IconComponent['name'] = 'dashboard';
}
