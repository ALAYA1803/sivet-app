import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { Venta } from '../../../core/domain/models';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { IconComponent } from '../../../shared/icons/icon.component';
import { SolesPipe } from '../../../shared/pipes/soles.pipe';
import { formatVentaId } from '../venta-id.util';

const CODIGO_CONFIRMACION = 'ANULAR';

@Component({
  selector: 'app-anular-venta-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent, IconComponent, SolesPipe],
  templateUrl: './anular-venta-modal.component.html',
})
export class AnularVentaModalComponent {
  private readonly _venta = signal<Venta | null>(null);

  /** Venta a anular; al asignarla se reinicia el formulario. */
  @Input() set venta(value: Venta | null) {
    this._venta.set(value);
    this.motivo.set('');
    this.confirmacion.set('');
    this.reposicion.set(true);
  }

  @Output() close = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<string>();

  readonly venta$ = this._venta.asReadonly();
  readonly motivo = signal('');
  readonly confirmacion = signal('');
  readonly reposicion = signal(true);

  readonly puede = computed(
    () => this.confirmacion() === CODIGO_CONFIRMACION && this.motivo().trim().length > 5,
  );

  formatId(id: string): string {
    return formatVentaId(id);
  }
}
