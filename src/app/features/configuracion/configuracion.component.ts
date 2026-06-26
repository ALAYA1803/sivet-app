import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/application/services/theme.service';
import { CardComponent } from '../../shared/ui/card.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { IconComponent } from '../../shared/icons/icon.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ButtonComponent, InputComponent, IconComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-7">
        <h1 class="text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
          Configuración
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">
          Ajustes generales de la clínica y preferencias de la aplicación
        </p>
      </div>

      <!-- Datos de la clínica -->
      <app-card class="block mb-6">
        <div class="flex items-center gap-2 mb-5">
          <div
            class="w-9 h-9 rounded-lg bg-[var(--primary-50)] text-[var(--primary-700)] flex items-center justify-center"
          >
            <app-icon name="stethoscope" [size]="18" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              Datos de la clínica
            </h2>
            <p class="text-xs text-slate-500">Información que aparece en comprobantes y reportes</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <app-input label="Nombre de la clínica" [value]="'Veterinaria SIVET'" />
          <app-input label="RUC" [value]="'20512345678'" />
          <app-input label="Teléfono" icon="phone" [value]="'(01) 234-5678'" />
          <app-input label="Email" icon="mail" [value]="'contacto@sivet.pe'" />
          <div class="col-span-2">
            <app-input
              label="Dirección"
              icon="map-pin"
              [value]="'Av. San Borja Sur 1234, San Borja, Lima'"
            />
          </div>
        </div>

        <div class="flex justify-end mt-5">
          <app-button variant="primary">
            <app-icon icon name="check" [size]="16" [stroke]="2.4" />Guardar cambios
          </app-button>
        </div>
      </app-card>

      <!-- Apariencia -->
      <app-card class="block">
        <div class="flex items-center gap-2 mb-5">
          <div
            class="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/15 text-violet-600 flex items-center justify-center"
          >
            <app-icon name="sparkles" [size]="18" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Apariencia</h2>
            <p class="text-xs text-slate-500">Personaliza el aspecto de SIVET</p>
          </div>
        </div>

        <div
          class="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40"
        >
          <div class="flex items-center gap-3">
            <app-icon
              [name]="theme.isDark() ? 'sparkles' : 'eye'"
              [size]="20"
              class="text-slate-500"
            />
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
                Modo {{ theme.isDark() ? 'Oscuro' : 'Claro' }}
              </p>
              <p class="text-xs text-slate-500">
                {{
                  theme.isDark()
                    ? 'Interfaz con colores oscuros, ideal para entornos con poca luz'
                    : 'Interfaz luminosa, ideal para uso diurno'
                }}
              </p>
            </div>
          </div>

          <!-- Toggle conectado al ThemeService -->
          <button
            type="button"
            role="switch"
            [attr.aria-checked]="theme.isDark()"
            (click)="theme.toggle()"
            class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40"
            [class]="theme.isDark() ? 'bg-[var(--primary)]' : 'bg-slate-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
              [class]="theme.isDark() ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
      </app-card>
    </div>
  `,
})
export class ConfiguracionComponent {
  readonly theme = inject(ThemeService);
}
