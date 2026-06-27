import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Credenciales } from '../../core/domain/models';
import { ToastService } from '../../core/application/services/toast.service';
import { ModalComponent } from './modal.component';
import { ButtonComponent } from './button.component';
import { IconComponent } from '../icons/icon.component';

/**
 * Modal de éxito que muestra las credenciales temporales recién generadas y
 * permite copiarlas al portapapeles para entregarlas manualmente. Reutilizable
 * por el backoffice (alta de clínicas) y por la gestión de personal.
 */
@Component({
  selector: 'app-credenciales-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent, IconComponent],
  template: `
    <app-modal
      [open]="!!credenciales"
      [title]="titulo"
      [subtitle]="mensaje"
      size="md"
      [hasFooter]="true"
      (close)="close.emit()"
    >
      @if (credenciales; as cred) {
        <div class="space-y-4">
          <div
            class="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            <app-icon name="check" [size]="16" [stroke]="2.4" class="mt-0.5 shrink-0" />
            <span>
              Credenciales de un solo uso: en su primer inicio de sesión se exigirá cambiar la
              contraseña.
            </span>
          </div>

          <div
            class="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800"
          >
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-xs font-medium uppercase tracking-wide text-slate-500">Usuario</span>
              <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {{ cred.username }}
              </span>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <span class="text-xs font-medium uppercase tracking-wide text-slate-500">
                Contraseña temporal
              </span>
              <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {{ cred.passwordTemporal }}
              </span>
            </div>
          </div>
        </div>
      }

      <div footer>
        <app-button variant="secondary" (clicked)="close.emit()">Cerrar</app-button>
        <app-button variant="primary" (clicked)="copiar()">
          <app-icon icon name="copy" [size]="16" />Copiar credenciales
        </app-button>
      </div>
    </app-modal>
  `,
})
export class CredencialesModalComponent {
  private readonly toast = inject(ToastService);

  /** Credenciales a mostrar; `null` mantiene el modal cerrado. */
  @Input() credenciales: Credenciales | null = null;
  @Input() titulo = 'Cuenta registrada';
  @Input() mensaje = 'Copia estas credenciales y entrégalas manualmente.';
  @Output() close = new EventEmitter<void>();

  copiar(): void {
    const cred = this.credenciales;
    if (!cred) return;
    const texto = `Usuario: ${cred.username} - Contraseña: ${cred.passwordTemporal}`;

    navigator.clipboard
      ?.writeText(texto)
      .then(() => this.toast.success('Credenciales copiadas al portapapeles'))
      .catch(() => this.toast.error('No se pudo copiar. Cópialas manualmente.'));
  }
}
