import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/application/services/admin.service';
import { ToastService } from '../../core/application/services/toast.service';
import { Credenciales } from '../../core/domain/models';
import { ModalComponent } from '../../shared/ui/modal.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { IconComponent } from '../../shared/icons/icon.component';

/**
 * Formulario de alta combinada (clínica + usuario administrador) que el
 * SUPERADMIN usa para dar de alta a un nuevo cliente. Al recibir `200 OK`
 * emite las credenciales (incluida la contraseña temporal).
 */
@Component({
  selector: 'app-registrar-clinica-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent, IconComponent],
  template: `
    <app-modal
      [open]="true"
      title="Registrar nueva clínica"
      subtitle="Alta de la clínica y de su usuario administrador"
      size="lg"
      [hasFooter]="true"
      (close)="cancelar()"
    >
      <form [formGroup]="form" class="space-y-6">
        <!-- Datos de la clínica -->
        <section formGroupName="clinica">
          <div class="flex items-center gap-2 mb-3">
            <app-icon name="stethoscope" [size]="16" class="text-[var(--primary-700)]" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Datos de la clínica
            </h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label [class]="labelClass">Nombre de la clínica *</label>
              <input formControlName="nombre" [class]="inputClass" placeholder="Ej: Veterinaria San Roque" />
            </div>
            <div>
              <label [class]="labelClass">Sede *</label>
              <input formControlName="sede" [class]="inputClass" placeholder="Ej: Sede Central" />
            </div>
            <div>
              <label [class]="labelClass">RUC *</label>
              <input formControlName="ruc" [class]="inputClass" placeholder="11 dígitos" maxlength="11" />
            </div>
            <div>
              <label [class]="labelClass">Teléfono *</label>
              <input formControlName="telefono" [class]="inputClass" placeholder="Ej: 987654321" />
            </div>
            <div>
              <label [class]="labelClass">Email *</label>
              <input formControlName="email" type="email" [class]="inputClass" placeholder="correo@clinica.com" />
            </div>
            <div class="sm:col-span-2">
              <label [class]="labelClass">Dirección *</label>
              <input formControlName="direccion" [class]="inputClass" placeholder="Av. ..." />
            </div>
          </div>
        </section>

        <!-- Datos del usuario administrador -->
        <section formGroupName="usuario" class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2 mb-3 mt-4">
            <app-icon name="users" [size]="16" class="text-[var(--primary-700)]" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Usuario administrador
            </h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label [class]="labelClass">Nombre completo *</label>
              <input formControlName="nombre" [class]="inputClass" placeholder="Ej: Ana Torres" />
            </div>
            <div>
              <label [class]="labelClass">Usuario (credencial) *</label>
              <input formControlName="username" [class]="inputClass" placeholder="Ej: atorres" />
            </div>
          </div>
          <p class="mt-3 text-xs text-slate-400">
            El backend generará una contraseña temporal; la verás al finalizar para copiarla.
          </p>
        </section>
      </form>

      <div footer>
        <app-button variant="secondary" (clicked)="cancelar()">Cancelar</app-button>
        <app-button variant="primary" [disabled]="guardando()" (clicked)="guardar()">
          <app-icon icon name="check" [size]="16" [stroke]="2.4" />
          {{ guardando() ? 'Registrando…' : 'Registrar clínica' }}
        </app-button>
      </div>
    </app-modal>
  `,
})
export class RegistrarClinicaModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();
  /** Emite las credenciales del alta exitosa. */
  @Output() registered = new EventEmitter<Credenciales>();

  readonly guardando = signal(false);

  readonly labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';
  readonly inputClass =
    'w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';

  readonly form: FormGroup = this.fb.group({
    clinica: this.fb.group({
      nombre: ['', Validators.required],
      sede: ['', Validators.required],
      ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
    }),
    usuario: this.fb.group({
      nombre: ['', Validators.required],
      username: ['', Validators.required],
    }),
  });

  cancelar(): void {
    this.close.emit();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Completa los datos de la clínica y del administrador');
      return;
    }

    const { clinica, usuario } = this.form.getRawValue();
    this.guardando.set(true);
    // Payload 100% plano: datos de la clínica + del administrador (doctor).
    this.admin
      .registrarClinicaOnboarding({
        nombre: clinica.nombre,
        ruc: clinica.ruc,
        sede: clinica.sede,
        telefono: clinica.telefono,
        email: clinica.email,
        direccion: clinica.direccion,
        doctorNombre: usuario.nombre,
        doctorUsername: usuario.username,
      })
      .subscribe({
        next: (res) => {
          this.guardando.set(false);
          this.registered.emit(res);
        },
        error: () => {
          this.guardando.set(false);
          this.toast.error('No se pudo registrar la clínica. Inténtalo de nuevo.');
        },
      });
  }
}
