import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ThemeService } from '../../core/application/services/theme.service';
import { TenantService } from '../../core/application/services/tenant.service';
import { ToastService } from '../../core/application/services/toast.service';
import { AuthService } from '../../core/application/services/auth.service';
import { PersonalService } from '../../core/application/services/personal.service';
import { Credenciales, Empleado } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { CredencialesModalComponent } from '../../shared/ui/credenciales-modal.component';
import { RegistrarEmpleadoModalComponent } from './registrar-empleado-modal.component';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    ButtonComponent,
    InputComponent,
    IconComponent,
    CredencialesModalComponent,
    RegistrarEmpleadoModalComponent,
  ],
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
          <app-input
            label="Nombre de la clínica *"
            [value]="form.controls.nombre.value"
            (valueChange)="form.controls.nombre.setValue($event)"
            [error]="errorMsg('nombre', 'Ingresa el nombre de la clínica')"
          />
          <app-input
            label="RUC *"
            [value]="form.controls.ruc.value"
            (valueChange)="form.controls.ruc.setValue($event)"
            [error]="errorMsg('ruc', 'El RUC debe tener 11 dígitos')"
          />
          <app-input
            label="Teléfono *"
            icon="phone"
            [value]="form.controls.telefono.value"
            (valueChange)="form.controls.telefono.setValue($event)"
            [error]="errorMsg('telefono', 'Ingresa el teléfono')"
          />
          <app-input
            label="Email *"
            icon="mail"
            type="email"
            [value]="form.controls.email.value"
            (valueChange)="form.controls.email.setValue($event)"
            [error]="errorMsg('email', 'Ingresa un email válido')"
          />
          <div class="col-span-2">
            <app-input
              label="Dirección *"
              icon="map-pin"
              [value]="form.controls.direccion.value"
              (valueChange)="form.controls.direccion.setValue($event)"
              [error]="errorMsg('direccion', 'Ingresa la dirección')"
            />
          </div>
        </div>

        <div class="flex justify-end mt-5">
          <app-button variant="primary" [disabled]="guardando()" (clicked)="guardarCambios()">
            <app-icon icon name="check" [size]="16" [stroke]="2.4" />
            {{ guardando() ? 'Guardando…' : 'Guardar cambios' }}
          </app-button>
        </div>
      </app-card>

      <!-- Personal (solo administrador de la clínica) -->
      @if (esAdminClinica()) {
        <app-card padding="none" class="block mb-6">
          <div class="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
            <div class="flex items-center gap-2">
              <div
                class="w-9 h-9 rounded-lg bg-[var(--primary-50)] text-[var(--primary-700)] flex items-center justify-center"
              >
                <app-icon name="users" [size]="18" />
              </div>
              <div>
                <h2 class="text-base font-semibold text-slate-900 dark:text-slate-100">Personal</h2>
                <p class="text-xs text-slate-500">Cuentas de acceso de tu equipo</p>
              </div>
            </div>
            <app-button variant="primary" size="sm" (clicked)="abrirRegistroEmpleado()">
              <app-icon icon name="plus" [size]="15" [stroke]="2.4" />Registrar empleado
            </app-button>
          </div>

          <div class="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
            <table class="w-full min-w-[480px] text-sm">
              <thead>
                <tr
                  class="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700"
                >
                  <th class="px-5 py-3">Empleado</th>
                  <th class="px-5 py-3">Usuario</th>
                  <th class="px-5 py-3">Rol</th>
                </tr>
              </thead>
              <tbody>
                @for (e of empleados(); track e.id) {
                  <tr
                    class="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td class="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {{ e.nombre }}
                    </td>
                    <td class="px-5 py-3 text-slate-600 dark:text-slate-300 tabular-nums">
                      {{ e.username }}
                    </td>
                    <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ e.rol }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="3" class="px-5 py-10 text-center text-slate-400">
                      @if (cargandoEmpleados()) {
                        Cargando personal…
                      } @else {
                        Aún no has registrado empleados.
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      }

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

    @if (mostrarRegistroEmpleado()) {
      <app-registrar-empleado-modal
        (close)="mostrarRegistroEmpleado.set(false)"
        (registered)="onEmpleadoRegistrado($event)"
      />
    }

    <app-credenciales-modal
      [credenciales]="credencialesEmpleado()"
      titulo="Empleado registrado"
      mensaje="Copia estas credenciales y entrégaselas a tu empleado"
      (close)="credencialesEmpleado.set(null)"
    />
  `,
})
export class ConfiguracionComponent {
  readonly theme = inject(ThemeService);
  private readonly fb = inject(FormBuilder);
  private readonly tenant = inject(TenantService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly personal = inject(PersonalService);

  /** Datos de la clínica activa (traídos del backend vía login). */
  readonly clinica = this.tenant.tenant;
  readonly guardando = signal(false);

  // --- Gestión de personal (solo ADMIN_CLINICA) ---
  readonly esAdminClinica = this.auth.isClinicAdmin;
  readonly empleados = signal<Empleado[]>([]);
  readonly cargandoEmpleados = signal(false);
  readonly mostrarRegistroEmpleado = signal(false);
  readonly credencialesEmpleado = signal<Credenciales | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', Validators.required],
  });

  constructor() {
    // El tenant ya está hidratado al entrar (APP_INITIALIZER); precargamos el form.
    const c = this.clinica();
    this.form.patchValue({
      nombre: c.clinicaNombre,
      ruc: c.ruc,
      telefono: c.telefono,
      email: c.email,
      direccion: c.direccion,
    });

    if (this.esAdminClinica()) {
      this.cargarEmpleados();
    }
  }

  private cargarEmpleados(): void {
    this.cargandoEmpleados.set(true);
    this.personal.listarEmpleados().subscribe({
      next: (es) => {
        this.empleados.set(es);
        this.cargandoEmpleados.set(false);
      },
      error: () => this.cargandoEmpleados.set(false),
    });
  }

  abrirRegistroEmpleado(): void {
    this.mostrarRegistroEmpleado.set(true);
  }

  onEmpleadoRegistrado(cred: Credenciales): void {
    this.mostrarRegistroEmpleado.set(false);
    this.credencialesEmpleado.set(cred);
    // Refresca la tabla con el empleado recién creado.
    this.cargarEmpleados();
  }

  /** Mensaje de error de un control solo cuando ya fue tocado. */
  errorMsg(control: 'nombre' | 'ruc' | 'telefono' | 'email' | 'direccion', mensaje: string): string | undefined {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty) ? mensaje : undefined;
  }

  guardarCambios(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revisa los campos obligatorios de la clínica');
      return;
    }

    this.guardando.set(true);
    // `sede` no es editable desde esta vista; se conserva la del tenant actual.
    this.tenant
      .actualizarClinica({ ...this.form.getRawValue(), sede: this.clinica().sede })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.toast.success('Datos guardados correctamente');
        },
        error: () => {
          this.guardando.set(false);
          this.toast.error('No se pudieron guardar los cambios');
        },
      });
  }
}
