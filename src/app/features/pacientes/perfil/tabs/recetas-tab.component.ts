import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { PacientesService } from '../../../../core/application/services/pacientes.service';
import { ClientesService } from '../../../../core/application/services/clientes.service';
import { TenantService } from '../../../../core/application/services/tenant.service';
import { RecetaPrintService } from '../../../../core/application/services/receta-print.service';
import { Atencion, Receta } from '../../../../core/domain/models';
import { CardComponent } from '../../../../shared/ui/card.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state.component';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { FechaPipe } from '../../../../shared/pipes/fecha.pipe';

interface RecetaVista {
  atencion: Atencion;
  receta: Receta;
}

@Component({
  selector: 'app-recetas-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, EmptyStateComponent, IconComponent, FechaPipe],
  templateUrl: './recetas-tab.component.html',
})
export class RecetasTabComponent {
  private readonly pacientes = inject(PacientesService);
  private readonly clientes = inject(ClientesService);
  private readonly tenant = inject(TenantService);
  private readonly print = inject(RecetaPrintService);
  private readonly _mascotaId = signal('');

  @Input({ required: true }) set mascotaId(value: string) {
    this._mascotaId.set(value);
  }

  readonly recetas = computed<RecetaVista[]>(() =>
    this.pacientes
      .getHistoria(this._mascotaId())
      .filter((a) => a.recetaId)
      .map((atencion) => ({ atencion, receta: this.pacientes.getReceta(atencion.recetaId!) }))
      .filter((x): x is RecetaVista => x.receta !== undefined),
  );

  /** Abre una ventana de impresión con la receta maquetada lista para firmar. */
  imprimir(vista: RecetaVista): void {
    const mascota = this.pacientes.getMascota(this._mascotaId());
    const cliente = mascota ? this.clientes.getById(mascota.clienteId) : undefined;
    const t = this.tenant.tenant();
    this.print.imprimir({
      clinicaNombre: t.clinicaNombre,
      clinicaSede: t.sede,
      paciente: {
        nombre: mascota?.nombre ?? '',
        especie: mascota?.especie ?? '',
        raza: mascota?.raza ?? '',
        edad: mascota?.edad ?? '',
        sexo: mascota?.sexo ?? '',
      },
      duenio: { nombre: cliente?.nombre ?? '', dni: cliente?.dni ?? '' },
      veterinario: vista.atencion.veterinario,
      fecha: vista.atencion.fecha,
      items: vista.receta.items,
    });
  }
}
