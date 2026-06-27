import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, IconName } from '../../shared/icons/icon.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { TenantService } from '../../core/application/services/tenant.service';
import { AuthService } from '../../core/application/services/auth.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { CatalogoService } from '../../core/application/services/catalogo.service';

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
  private readonly authService = inject(AuthService);
  private readonly pacientesService = inject(PacientesService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly router = inject(Router);
  readonly tenant = this.tenantService.tenant;
  readonly plataforma = this.tenantService.plataforma;

  /** Cierra la sesión y vuelve a la pantalla de login. */
  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  readonly sections: NavSection[] = [
    { id: 'principal', label: 'Principal' },
    { id: 'clinico', label: 'Módulo clínico' },
    { id: 'administrativo', label: 'Administración' },
  ];

  /** Estructura de navegación (estática); los contadores se calculan aparte. */
  private readonly baseItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', section: 'principal' },
    { label: 'Pacientes', icon: 'paw', route: '/pacientes', section: 'clinico' },
    { label: 'Nueva atención', icon: 'stethoscope', route: '/atencion', section: 'clinico' },
    { label: 'Agenda', icon: 'calendar', route: '/agenda', section: 'clinico' },
    { label: 'Punto de venta', icon: 'cart', route: '/pos', section: 'administrativo' },
    { label: 'Ventas', icon: 'receipt', route: '/ventas', section: 'administrativo' },
    { label: 'Catálogo', icon: 'box', route: '/catalogo', section: 'administrativo' },
    { label: 'Clientes', icon: 'users', route: '/clientes', section: 'administrativo' },
    { label: 'Reportes', icon: 'activity', route: '/reportes', section: 'administrativo' },
    { label: 'Configuración', icon: 'settings', route: '/configuracion', section: 'administrativo' },
  ];

  /**
   * Items con indicadores derivados de datos reales: el badge de Pacientes =
   * total de mascotas; la alerta de Catálogo = hay productos con stock crítico.
   */
  readonly items = computed<NavItem[]>(() => {
    const totalPacientes = this.pacientesService.total();
    const hayCriticos = this.catalogoService.stockCriticos().length > 0;
    return this.baseItems.map((item) => {
      if (item.route === '/pacientes') {
        return { ...item, badge: totalPacientes > 0 ? String(totalPacientes) : undefined };
      }
      if (item.route === '/catalogo') {
        return { ...item, alert: hayCriticos };
      }
      return item;
    });
  });

  itemsBySection(id: SectionId): NavItem[] {
    return this.items().filter((i) => i.section === id);
  }
}
