import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClientesService } from '../../core/application/services/clientes.service';
import { TenantService } from '../../core/application/services/tenant.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { DashboardService } from '../../core/application/services/dashboard.service';
import { ToastService } from '../../core/application/services/toast.service';
import { Cliente, Mascota, RecetaItem, TIPOS_ATENCION, TipoAtencion } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { PetAvatarComponent } from '../../shared/ui/pet-avatar.component';
import { IconComponent } from '../../shared/icons/icon.component';

interface PacienteRow {
  mascota: Mascota;
  cliente: Cliente | undefined;
}

interface Step {
  n: number;
  label: string;
}

@Component({
  selector: 'app-atencion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    PetAvatarComponent,
    IconComponent,
  ],
  templateUrl: './atencion.component.html',
})
export class AtencionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pacientes = inject(PacientesService);
  private readonly clientes = inject(ClientesService);
  private readonly tenant = inject(TenantService);
  private readonly dashboard = inject(DashboardService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly tiposAtencion = TIPOS_ATENCION;
  readonly examenFisico = [
    'Mucosas',
    'Hidratación',
    'Linfonódulos',
    'Auscultación cardiaca',
    'Auscultación pulmonar',
    'Palpación abdominal',
  ];
  readonly viasAdministracion = ['Vía oral', 'SC', 'IM', 'EV', 'Tópica'];

  readonly steps: Step[] = [
    { n: 1, label: 'Paciente' },
    { n: 2, label: 'Examen clínico' },
    { n: 3, label: 'Diagnóstico y receta' },
  ];

  readonly step = signal(1);
  /** Evita el doble envío del formulario mientras se guarda la atención. */
  readonly isSaving = signal(false);
  readonly pacienteId = signal('');
  readonly searchPaciente = signal('');
  readonly showPicker = signal(false);

  readonly paciente = computed(() => this.pacientes.getMascota(this.pacienteId()));
  readonly cliente = computed(() => {
    const p = this.paciente();
    return p ? this.clientes.getById(p.clienteId) : undefined;
  });

  /** Atención más reciente del paciente seleccionado (de la historia clínica). */
  readonly ultimaAtencion = computed(() => this.pacientes.getHistoria(this.pacienteId())[0]);

  /** Fecha corta en español (p. ej. "24 may"). */
  fechaCorta(iso: string): string {
    return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(new Date(iso));
  }

  readonly filteredPacientes = computed<PacienteRow[]>(() => {
    const q = this.searchPaciente().trim().toLowerCase();
    return this.pacientes
      .mascotas()
      .map((mascota) => ({ mascota, cliente: this.clientes.getById(mascota.clienteId) }))
      .filter(({ mascota, cliente }) => {
        if (!q) return true;
        return (
          mascota.nombre.toLowerCase().includes(q) ||
          (cliente?.nombre.toLowerCase().includes(q) ?? false) ||
          (cliente?.dni.includes(q) ?? false)
        );
      })
      .slice(0, 6);
  });

  readonly form: FormGroup = this.fb.group({
    tipo: ['Consulta general' as TipoAtencion, Validators.required],
    motivo: ['', Validators.required],
    temperatura: ['38.5', Validators.required],
    frecCardiaca: ['100', Validators.required],
    frecRespiratoria: ['24', Validators.required],
    peso: ['', Validators.required],
    diagnostico: ['', Validators.required],
    tratamiento: [''],
    incluirReceta: [true],
    receta: this.fb.array([this.nuevoMedicamento()]),
  });

  constructor() {
    // El peso por defecto sigue al paciente seleccionado.
    effect(() => {
      const p = this.paciente();
      if (p) this.form.controls['peso'].setValue(String(p.peso));
    });

    // Pre-selección desde el buscador global / acción "Iniciar atención":
    // si la URL trae `?mascotaId=`, se selecciona el paciente y se avanza al
    // paso del motivo para que el usuario solo escriba síntomas y diagnóstico.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const mascotaId = params.get('mascotaId');
      if (mascotaId) {
        this.pacienteId.set(mascotaId);
        this.step.set(2);
      }
    });
  }

  get receta(): FormArray {
    return this.form.get('receta') as FormArray;
  }

  get incluirReceta(): boolean {
    return this.form.get('incluirReceta')!.value;
  }

  private nuevoMedicamento(): FormGroup {
    return this.fb.group({
      medicamento: [''],
      dosis: [''],
      via: ['Vía oral'],
      duracion: [''],
      indicaciones: [''],
    });
  }

  // --- Selección de paciente ---
  seleccionarPaciente(id: string): void {
    this.pacienteId.set(id);
    this.searchPaciente.set('');
    this.showPicker.set(false);
  }
  cambiarPaciente(): void {
    this.pacienteId.set('');
  }

  // --- Stepper ---
  irAStep(n: number): void {
    if (n < this.step()) this.step.set(n);
  }
  siguiente(): void {
    this.step.update((s) => Math.min(3, s + 1));
  }
  anterior(): void {
    if (this.step() > 1) this.step.update((s) => s - 1);
    else this.router.navigate(['/dashboard']);
  }

  // --- Receta ---
  addReceta(): void {
    this.receta.push(this.nuevoMedicamento());
  }
  removeReceta(i: number): void {
    if (this.receta.length > 1) this.receta.removeAt(i);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }

  guardar(): void {
    const paciente = this.paciente();
    if (!paciente) {
      this.toast.error('Selecciona un paciente antes de continuar');
      this.step.set(1);
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Completa los campos obligatorios de la atención');
      return;
    }
    if (this.isSaving()) return;

    this.isSaving.set(true);
    const v = this.form.getRawValue();
    const recetaItems: RecetaItem[] = this.incluirReceta
      ? (v.receta as RecetaItem[]).filter((m) => m.medicamento.trim().length > 0)
      : [];

    this.pacientes
      .registrarAtencion(
        {
          mascotaId: paciente.id,
          fecha: new Date().toISOString(),
          tipo: v.tipo,
          motivo: v.motivo,
          diagnostico: v.diagnostico,
          tratamiento: v.tratamiento,
          veterinario: this.tenant.tenant().doctorNombre,
          temperatura: parseFloat(v.temperatura),
          frecCardiaca: parseInt(v.frecCardiaca, 10),
          frecRespiratoria: parseInt(v.frecRespiratoria, 10),
        },
        recetaItems,
      )
      .subscribe({
        next: (nueva) => {
          this.isSaving.set(false);
          // La historia clínica ya es reactiva (Signal de atenciones); refrescamos
          // también el dashboard para que sus KPIs y gráficas se actualicen al vuelo.
          this.dashboard.recargar();
          this.toast.success('Atención registrada correctamente');
          this.router.navigate(['/pacientes', nueva.mascotaId]);
        },
        error: () => {
          this.isSaving.set(false);
          this.toast.error('No se pudo registrar la atención. Inténtalo de nuevo.');
        },
      });
  }
}
