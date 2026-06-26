import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgendaService } from '../../core/application/services/agenda.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { ClientesService } from '../../core/application/services/clientes.service';
import { ToastService } from '../../core/application/services/toast.service';
import { Mascota } from '../../core/domain/models';
import { ModalComponent } from '../../shared/ui/modal.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { PetAvatarComponent } from '../../shared/ui/pet-avatar.component';
import { IconComponent } from '../../shared/icons/icon.component';

interface PacienteOption {
  mascota: Mascota;
  clienteNombre: string;
  clienteId: string;
}

@Component({
  selector: 'app-nueva-cita-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    ButtonComponent,
    PetAvatarComponent,
    IconComponent,
  ],
  template: `
    <app-modal
      [open]="true"
      title="Agendar cita"
      subtitle="Reserva una franja horaria para el paciente"
      size="md"
      [hasFooter]="true"
      (close)="cancelar()"
    >
      <form [formGroup]="form" class="space-y-5">
        <!-- Paciente -->
        <div>
          <label [class]="labelClass">Paciente *</label>
          @if (pacienteSeleccionado(); as p) {
            <div
              class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
            >
              <app-pet-avatar [especie]="p.mascota.especie" [size]="36" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {{ p.mascota.nombre }}
                </div>
                <div class="text-xs text-slate-500">{{ p.mascota.raza }} · {{ p.clienteNombre }}</div>
              </div>
              <button type="button" (click)="limpiarPaciente()" class="text-slate-400 hover:text-slate-700">
                <app-icon name="x" [size]="16" />
              </button>
            </div>
          } @else {
            <div class="relative">
              <input
                [value]="search()"
                (input)="search.set($any($event.target).value)"
                placeholder="Buscar mascota, dueño o DNI..."
                [class]="inputClass"
              />
              @if (search().length > 0) {
                <div
                  class="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto"
                >
                  @for (op of opciones(); track op.mascota.id) {
                    <button
                      type="button"
                      (click)="seleccionarPaciente(op)"
                      class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/40 text-left"
                    >
                      <app-pet-avatar [especie]="op.mascota.especie" [size]="30" />
                      <div class="min-w-0">
                        <div class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {{ op.mascota.nombre }}
                        </div>
                        <div class="text-xs text-slate-500 truncate">{{ op.clienteNombre }}</div>
                      </div>
                    </button>
                  } @empty {
                    <div class="px-3 py-3 text-sm text-slate-400">Sin coincidencias</div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Fecha -->
        <div>
          <label [class]="labelClass">Fecha *</label>
          <input type="date" formControlName="fecha" [class]="inputClass" />
        </div>

        <!-- Franja horaria -->
        <div>
          <label [class]="labelClass">
            Franja horaria *
            <span class="font-normal text-slate-400">({{ horasDisponibles().length }} disponibles)</span>
          </label>
          @if (horasDisponibles().length === 0) {
            <p class="text-sm text-amber-600 py-2">No quedan franjas libres en esta fecha.</p>
          } @else {
            <div class="grid grid-cols-4 sm:grid-cols-5 gap-2">
              @for (h of horasDisponibles(); track h) {
                <button
                  type="button"
                  (click)="form.controls['hora'].setValue(h)"
                  class="h-9 text-sm font-medium rounded-md border transition-colors"
                  [class]="
                    form.controls['hora'].value === h
                      ? 'border-[var(--primary)] bg-[var(--primary-50)] text-[var(--primary-700)]'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  "
                >
                  {{ h }}
                </button>
              }
            </div>
          }
        </div>

        <!-- Motivo -->
        <div>
          <label [class]="labelClass">Motivo *</label>
          <input
            formControlName="motivo"
            placeholder="Ej: Control de vacunas, consulta general..."
            [class]="inputClass"
          />
        </div>
      </form>

      <div footer>
        <app-button variant="secondary" (clicked)="cancelar()">Cancelar</app-button>
        <app-button variant="primary" (clicked)="guardar()">
          <app-icon icon name="calendar" [size]="16" />Agendar cita
        </app-button>
      </div>
    </app-modal>
  `,
})
export class NuevaCitaModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly agenda = inject(AgendaService);
  private readonly pacientes = inject(PacientesService);
  private readonly clientes = inject(ClientesService);
  private readonly toast = inject(ToastService);

  @Output() close = new EventEmitter<void>();
  /** Emite la fecha de la cita creada (para que la agenda salte a ese día). */
  @Output() saved = new EventEmitter<string>();

  readonly labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5';
  readonly inputClass =
    'w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';

  readonly search = signal('');
  readonly pacienteSeleccionado = signal<PacienteOption | null>(null);

  readonly form: FormGroup = this.fb.group({
    pacienteId: ['', Validators.required],
    fecha: [this.hoyISO(), Validators.required],
    hora: ['', Validators.required],
    motivo: ['', Validators.required],
  });

  /** Valor reactivo del control fecha para derivar las horas disponibles. */
  private readonly fechaValue = toSignal(this.form.controls['fecha'].valueChanges, {
    initialValue: this.form.controls['fecha'].value,
  });

  /** Opciones del buscador de pacientes. */
  readonly opciones = computed<PacienteOption[]>(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return [];
    return this.pacientes
      .mascotas()
      .map((mascota) => {
        const cliente = this.clientes.getById(mascota.clienteId);
        return { mascota, clienteNombre: cliente?.nombre ?? '', clienteId: mascota.clienteId };
      })
      .filter(
        (op) =>
          op.mascota.nombre.toLowerCase().includes(q) ||
          op.clienteNombre.toLowerCase().includes(q) ||
          this.clientes.getById(op.clienteId)?.dni.includes(q),
      )
      .slice(0, 6);
  });

  /** Horas libres = horario total menos las ya ocupadas ese día. */
  readonly horasDisponibles = computed<string[]>(() => {
    const fecha = this.fechaValue() ?? '';
    const ocupadas = new Set(this.agenda.horasOcupadas(fecha));
    return this.agenda.horarios.filter((h) => !ocupadas.has(h));
  });

  constructor() {
    // Si la hora elegida deja de estar disponible (cambió la fecha), se limpia.
    effect(() => {
      const disponibles = this.horasDisponibles();
      const actual = this.form.controls['hora'].value;
      if (actual && !disponibles.includes(actual)) {
        this.form.controls['hora'].setValue('');
      }
    });
  }

  private hoyISO(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  seleccionarPaciente(op: PacienteOption): void {
    this.pacienteSeleccionado.set(op);
    this.form.controls['pacienteId'].setValue(op.mascota.id);
    this.search.set('');
  }

  limpiarPaciente(): void {
    this.pacienteSeleccionado.set(null);
    this.form.controls['pacienteId'].setValue('');
  }

  cancelar(): void {
    this.close.emit();
  }

  guardar(): void {
    const paciente = this.pacienteSeleccionado();
    if (this.form.invalid || !paciente) {
      this.form.markAllAsTouched();
      this.toast.error('Selecciona paciente, fecha, franja horaria y motivo');
      return;
    }

    const v = this.form.getRawValue();
    // Punto de extensión futuro: aquí se dispararán los webhooks de WhatsApp/email.
    this.agenda.agregarCita({
      mascotaId: paciente.mascota.id,
      clienteId: paciente.clienteId,
      fecha: v.fecha,
      hora: v.hora,
      motivo: v.motivo,
    });

    this.toast.success(`Cita agendada · ${paciente.mascota.nombre} el ${v.fecha} a las ${v.hora}`);
    this.saved.emit(v.fecha);
    this.close.emit();
  }
}
