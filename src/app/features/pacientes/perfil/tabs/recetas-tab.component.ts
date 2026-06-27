import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { PacientesService } from '../../../../core/application/services/pacientes.service';
import { ExportService } from '../../../../core/application/services/export.service';
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
  private readonly exporter = inject(ExportService);
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

  /** Descarga el PDF de la receta generado por el backend (`GET /recetas/{id}/pdf`). */
  imprimir(recetaId: string): void {
    this.exporter.descargarRecetaPdf(recetaId);
  }
}
