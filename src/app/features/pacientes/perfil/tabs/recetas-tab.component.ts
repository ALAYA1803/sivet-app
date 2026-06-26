import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { PacientesService } from '../../../../core/application/services/pacientes.service';
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

  /** Id de la receta que se está aislando para imprimir (la única con `.print-area`). */
  readonly printingId = signal<string | null>(null);

  imprimir(recetaId: string): void {
    this.printingId.set(recetaId);
    // Deja que Angular aplique la clase `.print-area` antes de abrir el diálogo.
    setTimeout(() => {
      window.print();
      this.printingId.set(null);
    });
  }
}
