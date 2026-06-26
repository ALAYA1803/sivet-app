import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/icons/icon.component';
import { NotificacionesService } from '../../core/application/services/notificaciones.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  @Input() sidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  /** Abre el drawer lateral en móvil. */
  @Output() openMobile = new EventEmitter<void>();

  private readonly notificaciones = inject(NotificacionesService);

  readonly alertas = this.notificaciones.noLeidas;
  readonly cantidad = this.notificaciones.cantidadNoLeidas;
  readonly dropdownOpen = signal(false);

  toggleDropdown(): void {
    this.dropdownOpen.update((v) => !v);
  }

  cerrarDropdown(): void {
    this.dropdownOpen.set(false);
  }

  marcarTodasLeidas(): void {
    this.notificaciones.marcarTodasLeidas();
  }
}
