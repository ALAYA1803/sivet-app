import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastContainerComponent } from '../../shared/ui/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastContainerComponent],
  template: `
    <div class="flex h-screen bg-[var(--bg)] text-slate-900 dark:text-slate-100">
      <!-- Backdrop del drawer en móvil -->
      @if (mobileOpen()) {
        <div
          class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          (click)="closeMobile()"
        ></div>
      }
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        [mobileOpen]="mobileOpen()"
        (navigate)="closeMobile()"
        class="print:hidden"
      />
      <div class="flex-1 flex flex-col min-w-0 w-full">
        <app-topbar
          [sidebarCollapsed]="sidebarCollapsed()"
          (toggleSidebar)="toggleSidebar()"
          (openMobile)="openMobile()"
          class="print:hidden"
        />
        <main class="flex-1 overflow-y-auto print:overflow-visible">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-toast-container class="print:hidden" />
  `,
})
export class MainLayoutComponent {
  readonly sidebarCollapsed = signal(false);
  /** Estado del drawer lateral en pantallas pequeñas (off-canvas). */
  readonly mobileOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
