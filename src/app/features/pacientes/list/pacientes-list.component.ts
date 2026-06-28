import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService } from '../../../core/application/services/clientes.service';
import { PacientesService } from '../../../core/application/services/pacientes.service';
import { ExportService } from '../../../core/application/services/export.service';
import { ToastService } from '../../../core/application/services/toast.service';
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
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly search = signal('');
  readonly filtroEspecie = signal<FiltroEspecie>('todos');
  readonly showNuevoPaciente = signal(false);
  /** Mascota que se está editando (abre el modal precargado) o `null`. */
  readonly pacienteEditar = signal<Mascota | null>(null);

  constructor() {
    // Escucha activa del query param `q` (buscador global del topbar). Refleja
    // el término en el signal de búsqueda cada vez que cambia la URL, incluso si
    // el usuario ya está en /pacientes, filtrando la tabla al instante sin F5.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.search.set(params.get('q') ?? '');
    });
  }

  readonly filtros: FiltroOption[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'canino', label: 'Caninos' },
    { value: 'felino', label: 'Felinos' },
    { value: 'otros', label: 'Otros' },
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

  /**
   * Acción rápida: inicia una consulta médica para esta mascota. Lleva al
   * formulario de atención con el paciente preseleccionado vía query param.
   */
  iniciarAtencion(mascota: Mascota, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/atencion'], { queryParams: { mascotaId: mascota.id } });
  }

  /** Abre el modal en modo edición con los datos de la mascota. */
  editar(mascota: Mascota, event: Event): void {
    event.stopPropagation();
    this.pacienteEditar.set(mascota);
  }

  /**
   * Elimina una mascota tras confirmación nativa. El Signal del servicio quita
   * la fila al confirmarse el DELETE, por lo que la tabla se refresca al vuelo.
   */
  eliminar(mascota: Mascota, event: Event): void {
    event.stopPropagation();
    if (!confirm('¿De verdad quieres eliminar este paciente?')) return;
    this.pacientes.eliminarMascota(mascota.id).subscribe({
      next: () => this.toast.success(`${mascota.nombre} fue eliminado`),
      error: () => this.toast.error('No se pudo eliminar el paciente.'),
    });
  }

  exportar(): void {
    this.exporter.descargarReportePacientes(this.search());
  }
}
