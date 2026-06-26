import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../../shared/icons/icon.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { TenantService } from '../../core/application/services/tenant.service';

type SectionId = 'principal' | 'clinico' | 'administrativo';

interface NavItem {
  label: string;
  icon: IconName;
  route: string;
  section: SectionId;
  badge?: string;
  alert?: boolean;
}

interface NavSection {
  id: SectionId;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent, BadgeComponent, AvatarComponent],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  /** Modo compacto (solo iconos) — desktop. */
  @Input() collapsed = false;
  /** Drawer abierto en móvil (off-canvas). */
  @Input() mobileOpen = false;
  /** Se emite al navegar a una ruta para cerrar el drawer en móvil. */
  @Output() navigate = new EventEmitter<void>();

  private readonly tenantService = inject(TenantService);
  readonly tenant = this.tenantService.tenant;
  readonly plataforma = this.tenantService.plataforma;

  readonly sections: NavSection[] = [
    { id: 'principal', label: 'Principal' },
    { id: 'clinico', label: 'Módulo clínico' },
    { id: 'administrativo', label: 'Administración' },
  ];

  readonly items: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', section: 'principal' },
    { label: 'Pacientes', icon: 'paw', route: '/pacientes', section: 'clinico', badge: '24' },
    { label: 'Nueva atención', icon: 'stethoscope', route: '/atencion', section: 'clinico' },
    { label: 'Agenda', icon: 'calendar', route: '/agenda', section: 'clinico' },
    { label: 'Punto de venta', icon: 'cart', route: '/pos', section: 'administrativo' },
    { label: 'Ventas', icon: 'receipt', route: '/ventas', section: 'administrativo' },
    { label: 'Catálogo', icon: 'box', route: '/catalogo', section: 'administrativo', alert: true },
    { label: 'Clientes', icon: 'users', route: '/clientes', section: 'administrativo' },
    { label: 'Reportes', icon: 'activity', route: '/reportes', section: 'administrativo' },
    { label: 'Configuración', icon: 'settings', route: '/configuracion', section: 'administrativo' },
  ];

  itemsBySection(id: SectionId): NavItem[] {
    return this.items.filter((i) => i.section === id);
  }
}
