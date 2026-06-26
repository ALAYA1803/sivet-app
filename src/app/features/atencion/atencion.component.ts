import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClientesService } from '../../core/application/services/clientes.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
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
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

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
  readonly pacienteId = signal('m1');
  readonly searchPaciente = signal('');
  readonly showPicker = signal(false);

  /** Nombres de los archivos seleccionados para adjuntar al guardar la atención. */
  readonly archivosAdjuntos = signal<string[]>([]);

  readonly paciente = computed(() => this.pacientes.getMascota(this.pacienteId()));
  readonly cliente = computed(() => {
    const p = this.paciente();
    return p ? this.clientes.getById(p.clienteId) : undefined;
  });

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

  // --- Estudios adjuntos ---
  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const nombres = Array.from(input.files).map((f) => f.name);
    this.archivosAdjuntos.update((actuales) => [...actuales, ...nombres]);
    // Permite volver a seleccionar el mismo archivo si se elimina y reintenta.
    input.value = '';
  }

  removerArchivo(nombre: string): void {
    this.archivosAdjuntos.update((actuales) => actuales.filter((n) => n !== nombre));
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

    const v = this.form.getRawValue();
    const recetaItems: RecetaItem[] = this.incluirReceta
      ? (v.receta as RecetaItem[]).filter((m) => m.medicamento.trim().length > 0)
      : [];

    const nueva = this.pacientes.registrarAtencion(
      {
        mascotaId: paciente.id,
        fecha: new Date().toISOString(),
        tipo: v.tipo,
        motivo: v.motivo,
        diagnostico: v.diagnostico,
        tratamiento: v.tratamiento,
        veterinario: 'Dra. Carla Espinoza',
        temperatura: parseFloat(v.temperatura),
        frecCardiaca: parseInt(v.frecCardiaca, 10),
        frecRespiratoria: parseInt(v.frecRespiratoria, 10),
      },
      recetaItems,
    );

    this.toast.success('Atención registrada correctamente');
    this.router.navigate(['/pacientes', nueva.mascotaId]);
  }
}
