import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { PosService } from '../../../../core/application/services/pos.service';
import { CardComponent } from '../../../../shared/ui/card.component';
import { BadgeComponent } from '../../../../shared/ui/badge.component';
import { SolesPipe } from '../../../../shared/pipes/soles.pipe';
import { FechaPipe } from '../../../../shared/pipes/fecha.pipe';

@Component({
  selector: 'app-ventas-mascota-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, SolesPipe, FechaPipe],
  templateUrl: './ventas-mascota-tab.component.html',
})
export class VentasMascotaTabComponent {
  private readonly pos = inject(PosService);
  private readonly _clienteId = signal('');

  @Input({ required: true }) set clienteId(value: string) {
    this._clienteId.set(value);
  }

  readonly ventas = computed(() =>
    this.pos.ventas().filter((v) => v.clienteId === this._clienteId()),
  );

  itemsResumen(items: { nombre: string }[]): string {
    return items.map((i) => i.nombre).join(', ');
  }
}
