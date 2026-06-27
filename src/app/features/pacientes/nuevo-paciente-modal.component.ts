import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ClientesService } from '../../core/application/services/clientes.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { ToastService } from '../../core/application/services/toast.service';
import { ESPECIES, SEXOS } from '../../core/domain/models';
import { ModalComponent } from '../../shared/ui/modal.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { IconComponent } from '../../shared/icons/icon.component';

@Component({
  selector: 'app-nuevo-paciente-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent, IconComponent],
  template: `
    <app-modal
      [open]="true"
      title="Nuevo paciente"
      subtitle="Registra la mascota y a su dueño"
      size="lg"
      [hasFooter]="true"
      (close)="cancelar()"
    >
      <form [formGroup]="form" class="space-y-6">
        <!-- Datos de la mascota -->
        <section formGroupName="mascota">
          <div class="flex items-center gap-2 mb-3">
            <app-icon name="paw" [size]="16" class="text-[var(--primary-700)]" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Datos de la mascota
            </h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label [class]="labelClass">Nombre *</label>
              <input formControlName="nombre" [class]="inputClass" placeholder="Ej: Firulais" />
            </div>
            <div>
              <label [class]="labelClass">Especie *</label>
              <select formControlName="especie" [class]="inputClass">
                @for (e of especies; track e) {
                  <option [value]="e">{{ e }}</option>
                }
              </select>
            </div>
            <div>
              <label [class]="labelClass">Raza *</label>
              <input formControlName="raza" [class]="inputClass" placeholder="Ej: Labrador" />
            </div>
            <div>
              <label [class]="labelClass">Sexo *</label>
              <select formControlName="sexo" [class]="inputClass">
                <option value="M">Macho</option>
                <option value="H">Hembra</option>
              </select>
            </div>
            <div>
              <label [class]="labelClass">Edad *</label>
              <input formControlName="edad" [class]="inputClass" placeholder="Ej: 3 años" />
            </div>
            <div>
              <label [class]="labelClass">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                formControlName="peso"
                [class]="inputClass"
                placeholder="Ej: 12.5"
              />
            </div>
            <div>
              <label [class]="labelClass">Color</label>
              <input formControlName="color" [class]="inputClass" placeholder="Ej: Marrón" />
            </div>
            <div>
              <label [class]="labelClass">Microchip</label>
              <input formControlName="microchip" [class]="inputClass" placeholder="Opcional" />
            </div>
            <label class="col-span-2 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                formControlName="esterilizada"
                class="w-4 h-4 accent-[var(--primary)]"
              />
              <span class="text-sm text-slate-700 dark:text-slate-300">Esterilizada / castrado</span>
            </label>
          </div>
        </section>

        <!-- Datos del cliente -->
        <section formGroupName="cliente" class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2 mb-3 mt-4">
            <app-icon name="users" [size]="16" class="text-[var(--primary-700)]" />
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Datos del cliente (dueño)
            </h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label [class]="labelClass">Nombre completo *</label>
              <input formControlName="nombre" [class]="inputClass" placeholder="Ej: Ana Torres" />
            </div>
            <div>
              <label [class]="labelClass">DNI *</label>
              <input formControlName="dni" [class]="inputClass" placeholder="8 dígitos" maxlength="8" />
            </div>
            <div>
              <label [class]="labelClass">Teléfono *</label>
              <input formControlName="telefono" [class]="inputClass" placeholder="Ej: 987654321" />
            </div>
            <div>
              <label [class]="labelClass">Email</label>
              <input formControlName="email" [class]="inputClass" placeholder="correo@ejemplo.com" />
            </div>
            <div class="col-span-2">
              <label [class]="labelClass">Dirección</label>
              <input formControlName="direccion" [class]="inputClass" placeholder="Av. ..." />
            </div>
          </div>
        </section>
      </form>

      <div footer>
        <app-button variant="secondary" (clicked)="cancelar()">Cancelar</app-button>
        <app-button variant="primary" (clicked)="guardar()">
          <app-icon icon name="check" [size]="16" [stroke]="2.4" />Registrar paciente
        </app-button>
      </div>
    </app-modal>
  `,
})
export class NuevoPacienteModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pacientes = inject(PacientesService);
  private readonly clientes = inject(ClientesService);
  private readonly toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();
  /** Emite el id de la mascota recién creada. */
  @Output() saved = new EventEmitter<string>();

  readonly especies = ESPECIES;
  readonly sexos = SEXOS;

  readonly labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';
  readonly inputClass =
    'w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';

  readonly form: FormGroup = this.fb.group({
    mascota: this.fb.group({
      nombre: ['', Validators.required],
      especie: ['Canino', Validators.required],
      raza: ['', Validators.required],
      sexo: ['M', Validators.required],
      edad: ['', Validators.required],
      peso: ['', Validators.required],
      color: [''],
      microchip: [''],
      esterilizada: [false],
    }),
    cliente: this.fb.group({
      nombre: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(8)]],
      telefono: ['', Validators.required],
      email: [''],
      direccion: [''],
    }),
  });

  cancelar(): void {
    this.close.emit();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Completa los campos obligatorios de la mascota y el dueño');
      return;
    }

    const { mascota, cliente } = this.form.getRawValue();

    // Primero se crea el dueño (POST) y, con su id, la mascota (POST encadenado).
    this.clientes
      .agregarCliente({
        nombre: cliente.nombre,
        dni: cliente.dni,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
      })
      .pipe(
        switchMap((nuevoCliente) =>
          this.pacientes.agregarMascota({
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza,
            sexo: mascota.sexo,
            edad: mascota.edad,
            peso: parseFloat(mascota.peso) || 0,
            color: mascota.color,
            clienteId: nuevoCliente.id,
            foto: null,
            esterilizada: mascota.esterilizada,
            microchip: mascota.microchip || undefined,
          }),
        ),
      )
      .subscribe((nuevaMascota) => {
        this.toast.success(`${nuevaMascota.nombre} fue registrado correctamente`);
        this.saved.emit(nuevaMascota.id);
        this.close.emit();
      });
  }
}
