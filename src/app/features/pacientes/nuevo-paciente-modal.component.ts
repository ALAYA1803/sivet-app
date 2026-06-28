import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ClientesService } from '../../core/application/services/clientes.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { ToastService } from '../../core/application/services/toast.service';
import { ESPECIES, Mascota, SEXOS } from '../../core/domain/models';
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
      [title]="esEdicion ? 'Editar paciente' : 'Nuevo paciente'"
      [subtitle]="esEdicion ? 'Actualiza la ficha de la mascota' : 'Registra la mascota y a su dueño'"
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
              <label [class]="labelClass">Color *</label>
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

            <!-- Ficha médica -->
            <div class="col-span-2">
              <label [class]="labelClass">Vacunación</label>
              <textarea
                formControlName="vacunacion"
                rows="2"
                [class]="textareaClass"
                placeholder="Ej: Óctuple y antirrábica al día. Próximo refuerzo en agosto."
              ></textarea>
            </div>
            <div class="col-span-2">
              <label [class]="labelClass">Alergias</label>
              <textarea
                formControlName="alergias"
                rows="2"
                [class]="textareaClass"
                placeholder="Ej: Sensibilidad a la proteína de pollo."
              ></textarea>
            </div>
            <div class="col-span-2">
              <label [class]="labelClass">Notas médicas</label>
              <textarea
                formControlName="notasMedicas"
                rows="2"
                [class]="textareaClass"
                placeholder="Ej: Paciente nervioso en consulta. Manejar con calma."
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Datos del cliente (solo al registrar; en edición el dueño ya existe) -->
        @if (!esEdicion) {
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
              <label [class]="labelClass">Email *</label>
              <input formControlName="email" type="email" [class]="inputClass" placeholder="correo@ejemplo.com" />
            </div>
            <div class="col-span-2">
              <label [class]="labelClass">Dirección *</label>
              <input formControlName="direccion" [class]="inputClass" placeholder="Av. ..." />
            </div>
          </div>
        </section>
        }
      </form>

      <div footer>
        <app-button variant="secondary" (clicked)="cancelar()">Cancelar</app-button>
        <app-button variant="primary" [disabled]="isSaving()" (clicked)="guardar()">
          <app-icon icon name="check" [size]="16" [stroke]="2.4" />
          {{ isSaving() ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar paciente' }}
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
  /** Emite el id de la mascota creada o actualizada. */
  @Output() saved = new EventEmitter<string>();

  readonly especies = ESPECIES;
  readonly sexos = SEXOS;

  readonly labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';
  readonly inputClass =
    'w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';
  readonly textareaClass =
    'w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] resize-none';

  /** Mascota en edición; `null` al registrar una nueva. */
  private _editar: Mascota | null = null;
  /** Evita el doble envío mientras se guarda. */
  readonly isSaving = signal(false);

  /**
   * Cuando se recibe una mascota, el modal entra en modo edición: precarga sus
   * datos y oculta la sección del dueño (que ya existe). Sin valor ⇒ alta nueva.
   */
  @Input() set mascota(value: Mascota | null | undefined) {
    this._editar = value ?? null;
    if (value) {
      this.form.get('cliente')?.disable();
      this.form.get('mascota')?.patchValue({
        nombre: value.nombre,
        especie: value.especie,
        raza: value.raza,
        sexo: value.sexo,
        edad: value.edad,
        peso: value.peso,
        color: value.color,
        microchip: value.microchip ?? '',
        esterilizada: value.esterilizada,
        vacunacion: value.vacunacion ?? '',
        alergias: value.alergias ?? '',
        notasMedicas: value.notasMedicas ?? '',
      });
    }
  }

  get esEdicion(): boolean {
    return this._editar !== null;
  }

  readonly form: FormGroup = this.fb.group({
    mascota: this.fb.group({
      nombre: ['', Validators.required],
      especie: ['Canino', Validators.required],
      raza: ['', Validators.required],
      sexo: ['M', Validators.required],
      edad: ['', Validators.required],
      peso: ['', [Validators.required, Validators.min(0)]],
      color: ['', Validators.required],
      microchip: [''],
      esterilizada: [false],
      vacunacion: [''],
      alergias: [''],
      notasMedicas: [''],
    }),
    cliente: this.fb.group({
      nombre: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
    }),
  });

  cancelar(): void {
    this.close.emit();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error(
        this.esEdicion
          ? 'Completa los campos obligatorios de la mascota'
          : 'Completa los campos obligatorios de la mascota y el dueño',
      );
      return;
    }
    if (this.isSaving()) return;
    this.isSaving.set(true);

    this.esEdicion ? this.actualizar() : this.crear();
  }

  /** Construye el bloque de datos médicos de la mascota desde el formulario. */
  private datosMascota(clienteId: string): Omit<Mascota, 'id'> {
    const m = this.form.getRawValue().mascota;
    return {
      nombre: m.nombre,
      especie: m.especie,
      raza: m.raza,
      sexo: m.sexo,
      edad: m.edad,
      peso: parseFloat(m.peso) || 0,
      color: m.color,
      clienteId,
      foto: this._editar?.foto ?? null,
      esterilizada: m.esterilizada,
      microchip: m.microchip || undefined,
      vacunacion: m.vacunacion?.trim() || undefined,
      alergias: m.alergias?.trim() || undefined,
      notasMedicas: m.notasMedicas?.trim() || undefined,
    };
  }

  /** Alta: crea el dueño (POST) y, con su id, la mascota (POST encadenado). */
  private crear(): void {
    const cliente = this.form.getRawValue().cliente;
    this.clientes
      .agregarCliente({
        nombre: cliente.nombre,
        dni: cliente.dni,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
      })
      .pipe(switchMap((nuevoCliente) => this.pacientes.agregarMascota(this.datosMascota(nuevoCliente.id))))
      .subscribe({
        next: (nuevaMascota) => {
          this.isSaving.set(false);
          this.toast.success(`${nuevaMascota.nombre} fue registrado correctamente`);
          this.saved.emit(nuevaMascota.id);
          this.close.emit();
        },
        error: () => {
          this.isSaving.set(false);
          this.toast.error('No se pudo registrar el paciente. Inténtalo de nuevo.');
        },
      });
  }

  /** Edición: actualiza la mascota (PUT) conservando su dueño. */
  private actualizar(): void {
    const id = this._editar!.id;
    this.pacientes.actualizarMascota(id, this.datosMascota(this._editar!.clienteId)).subscribe({
      next: (upd) => {
        this.isSaving.set(false);
        this.toast.success(`Los datos de ${upd.nombre} fueron actualizados`);
        this.saved.emit(upd.id);
        this.close.emit();
      },
      error: () => {
        this.isSaving.set(false);
        this.toast.error('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      },
    });
  }
}
