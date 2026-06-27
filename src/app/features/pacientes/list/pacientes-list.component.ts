import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClientesService } from '../../../core/application/services/clientes.service';
import { PacientesService } from '../../../core/application/services/pacientes.service';
import { ExportService } from '../../../core/application/services/export.service';
import { Atencion, Cliente, Mascota } from '../../../core/domain/models';
import { CardComponent } from '../../../shared/ui/card.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { InputComponent } from '../../../shared/ui/input.component';
import { PetAvatarComponent } from '../../../shared/ui/pet-avatar.component';
import { IconComponent } from '../../../shared/icons/icon.component';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { NuevoPacienteModalComponent } from '../nuevo-paciente-modal.component';

type FiltroEspecie = 'todos' | 'canino' | 'felino' | 'otros';

interface FiltroOption {
  value: FiltroEspecie;
  label: string;
}

interface PacienteRow {
  mascota: Mascota;
  cliente: Cliente | undefined;
  ultima: Atencion | undefined;
}

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    ButtonComponent,
    InputComponent,
    PetAvatarComponent,
    IconComponent,
    FechaPipe,
    NuevoPacienteModalComponent,
  ],
  templateUrl: './pacientes-list.component.html',
})
export class PacientesListComponent {
  private readonly pacientes = inject(PacientesService);
  private readonly clientes = inject(ClientesService);
  private readonly exporter = inject(ExportService);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly filtroEspecie = signal<FiltroEspecie>('todos');
  readonly showNuevoPaciente = signal(false);

  readonly filtros: FiltroOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'canino', label: '🐕 Caninos' },
    { value: 'felino', label: '🐈 Felinos' },
    { value: 'otros', label: '🐾 Otros' },
  ];

  readonly total = this.pacientes.total;

  /** Filas enriquecidas con cliente y última atención, derivadas del servicio. */
  private readonly rows = computed<PacienteRow[]>(() =>
    this.pacientes.mascotas().map((mascota) => ({
      mascota,
      cliente: this.clientes.getById(mascota.clienteId),
      ultima: this.pacientes.getHistoria(mascota.id)[0],
    })),
  );

  /** Lista filtrada reactiva (búsqueda + especie). */
  readonly filtered = computed<PacienteRow[]>(() => {
    const especie = this.filtroEspecie();
    const q = this.search().trim().toLowerCase();
    return this.rows().filter(({ mascota, cliente }) => {
      if (especie !== 'todos' && mascota.especie.toLowerCase() !== especie) return false;
      if (!q) return true;
      return (
        mascota.nombre.toLowerCase().includes(q) ||
        (cliente?.nombre.toLowerCase().includes(q) ?? false) ||
        (cliente?.dni.includes(q) ?? false) ||
        mascota.raza.toLowerCase().includes(q)
      );
    });
  });

  abrirPerfil(id: string): void {
    this.router.navigate(['/pacientes', id]);
  }

  onPacienteCreado(id: string): void {
    this.router.navigate(['/pacientes', id]);
  }

  exportar(): void {
    this.exporter.descargarReportePacientes(this.search());
  }
}
