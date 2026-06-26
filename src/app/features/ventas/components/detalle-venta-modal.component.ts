import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { ClientesService } from '../../../core/application/services/clientes.service';
import { Venta } from '../../../core/domain/models';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { IconComponent } from '../../../shared/icons/icon.component';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { formatVentaId } from '../venta-id.util';

@Component({
  selector: 'app-detalle-venta-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent, IconComponent, SolesPipe],
  templateUrl: './detalle-venta-modal.component.html',
})
export class DetalleVentaModalComponent {
  private readonly clientes = inject(ClientesService);
  private readonly _venta = signal<Venta | null>(null);

  @Input() set venta(value: Venta | null) {
    this._venta.set(value);
  }

  @Output() close = new EventEmitter<void>();

  readonly venta$ = this._venta.asReadonly();
  readonly cliente = computed(() => {
    const v = this._venta();
    return v ? this.clientes.getById(v.clienteId) : undefined;
  });

  formatId(id: string): string {
    return formatVentaId(id);
  }

  fechaLarga(fecha: string): string {
    return new Date(fecha).toLocaleString('es-PE', { dateStyle: 'long', timeStyle: 'short' });
  }

  imprimir(): void {
    window.print();
  }
}
