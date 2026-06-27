import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonalService } from '../../core/application/services/personal.service';
import { ToastService } from '../../core/application/services/toast.service';
import { Credenciales, ROLES_EMPLEADO } from '../../core/domain/models';
import { ModalComponent } from '../../shared/ui/modal.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { IconComponent } from '../../shared/icons/icon.component';

/**
 * Alta de un empleado de la clínica (Veterinario/Recepcionista). Al confirmarse
 * emite las credenciales temporales para entregarlas al personal.
 */
@Component({
  selector: 'app-registrar-empleado-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent, IconComponent],
  template: `
    <app-modal
      [open]="true"
      title="Registrar empleado"
      subtitle="Crea una cuenta de acceso para tu personal"
      size="md"
      [hasFooter]="true"
      (close)="cancelar()"
    >
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label [class]="labelClass">Nombre completo *</label>
          <input formControlName="nombre" [class]="inputClass" placeholder="Ej: Carlos Díaz" />
        </div>
        <div>
          <label [class]="labelClass">Usuario (credencial) *</label>
          <input formControlName="username" [class]="inputClass" placeholder="Ej: cdiaz" />
        </div>
        <div>
          <label [class]="labelClass">Rol *</label>
          <select formControlName="rol" [class]="inputClass">
            @for (r of roles; track r) {
              <option [value]="r">{{ r }}</option>
            }
          </select>
        </div>
        <p class="sm:col-span-2 text-xs text-slate-400">
          El backend generará una contraseña temporal; la verás al finalizar para copiarla.
        </p>
      </form>

      <div footer>
        <app-button variant="secondary" (clicked)="cancelar()">Cancelar</app-button>
        <app-button variant="primary" [disabled]="guardando()" (clicked)="guardar()">
          <app-icon icon name="check" [size]="16" [stroke]="2.4" />
          {{ guardando() ? 'Registrando…' : 'Registrar empleado' }}
        </app-button>
      </div>
    </app-modal>
  `,
})
export class RegistrarEmpleadoModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly personal = inject(PersonalService);
  private readonly toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();
  /** Emite las credenciales del empleado recién creado. */
  @Output() registered = new EventEmitter<Credenciales>();

  readonly roles = ROLES_EMPLEADO;
  readonly guardando = signal(false);

  readonly labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';
  readonly inputClass =
    'w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';

  readonly form: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    username: ['', Validators.required],
    rol: ['Veterinario', Validators.required],
  });

  cancelar(): void {
    this.close.emit();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Completa el nombre, usuario y rol del empleado');
      return;
    }

    this.guardando.set(true);
    this.personal.registrarEmpleado(this.form.getRawValue()).subscribe({
      next: (cred) => {
        this.guardando.set(false);
        this.registered.emit(cred);
      },
      error: () => {
        this.guardando.set(false);
        this.toast.error('No se pudo registrar el empleado. Inténtalo de nuevo.');
      },
    });
  }
}
