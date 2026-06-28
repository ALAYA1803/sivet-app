import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);

  readonly alertas = this.notificaciones.noLeidas;
  readonly cantidad = this.notificaciones.cantidadNoLeidas;
  readonly dropdownOpen = signal(false);

  /**
   * Búsqueda global: redirige a la lista de pacientes con el término como
   * query param (`/pacientes?q=...`) para que la tabla lo lea y filtre.
   */
  buscar(termino: string): void {
    const q = termino.trim();
    this.router.navigate(['/pacientes'], { queryParams: q ? { q } : {} });
  }

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
