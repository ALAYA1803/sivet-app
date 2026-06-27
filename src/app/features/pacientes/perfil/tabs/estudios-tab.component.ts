import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { PacientesService } from '../../../../core/application/services/pacientes.service';
import { CardComponent } from '../../../../shared/ui/card.component';
import { BadgeComponent } from '../../../../shared/ui/badge.component';
import { IconComponent } from '../../../../shared/icons/icon.component';

/** Listado de estudios complementarios de la mascota (solo texto, §2.10). */
@Component({
  selector: 'app-estudios-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, IconComponent],
  template: `
    @if (estudios().length === 0) {
      <app-card class="block">
        <div class="flex flex-col items-center justify-center gap-2 py-10 text-center text-slate-400">
          <app-icon name="file-text" [size]="32" />
          <span class="text-sm font-medium">Sin estudios registrados</span>
        </div>
      </app-card>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (e of estudios(); track e.id) {
          <app-card class="block">
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-[var(--primary-50)] text-[var(--primary-700)] flex items-center justify-center flex-shrink-0"
              >
                <app-icon name="file-text" [size]="18" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {{ e.titulo }}
                  </div>
                  <app-badge tone="info">{{ e.tag }}</app-badge>
                </div>
                <div class="text-xs text-slate-500 mt-1">{{ e.fecha }} · {{ e.veterinario }}</div>
              </div>
            </div>
          </app-card>
        }
      </div>
    }
  `,
})
export class EstudiosTabComponent {
  private readonly pacientes = inject(PacientesService);
  private readonly _mascotaId = signal('');

  @Input({ required: true }) set mascotaId(value: string) {
    this._mascotaId.set(value);
  }

  readonly estudios = computed(() => this.pacientes.getEstudios(this._mascotaId()));
}
