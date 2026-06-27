import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/application/services/auth.service';
import { AdminService } from '../../core/application/services/admin.service';
import { Clinica, Credenciales } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { CredencialesModalComponent } from '../../shared/ui/credenciales-modal.component';
import { RegistrarClinicaModalComponent } from './registrar-clinica-modal.component';

/**
 * Panel maestro del SUPERADMIN. Lista las clínicas dadas de alta y permite
 * registrar nuevas, mostrando sus credenciales temporales para entregarlas
 * manualmente al cliente.
 */
@Component({
  selector: 'app-backoffice',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    ButtonComponent,
    IconComponent,
    CredencialesModalComponent,
    RegistrarClinicaModalComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
      <!-- Barra superior -->
      <header
        class="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-8 h-16"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-50)] text-[var(--primary-700)]"
          >
            <app-icon name="shield" [size]="20" />
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Panel Superadmin
            </div>
            <div class="text-xs text-slate-500">SIVET · Administración de la plataforma</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden sm:block text-sm text-slate-500">{{ nombre() }}</span>
          <app-button variant="secondary" size="sm" (clicked)="logout()">
            <app-icon icon name="log-out" [size]="15" />Cerrar sesión
          </app-button>
        </div>
      </header>

      <main class="mx-auto max-w-5xl px-4 sm:px-8 py-8">
        <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
          <div>
            <h1 class="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
              Clínicas
            </h1>
            <p class="text-slate-500 dark:text-slate-400 mt-1">
              {{ clinicas().length }} clínica(s) registradas en la plataforma
            </p>
          </div>
          <app-button variant="primary" (clicked)="abrirRegistro()">
            <app-icon icon name="plus" [size]="16" [stroke]="2.4" />Registrar nueva clínica
          </app-button>
        </div>

        <app-card padding="none">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[640px] text-sm">
              <thead>
                <tr
                  class="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700"
                >
                  <th class="px-5 py-3">Clínica</th>
                  <th class="px-5 py-3">RUC</th>
                  <th class="px-5 py-3">Sede</th>
                  <th class="px-5 py-3">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                @for (c of clinicas(); track c.id) {
                  <tr
                    class="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td class="px-5 py-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-9 h-9 rounded-lg bg-[var(--primary-50)] text-[var(--primary-700)] flex items-center justify-center flex-shrink-0"
                        >
                          <app-icon name="stethoscope" [size]="16" />
                        </div>
                        <span class="font-medium text-slate-900 dark:text-slate-100">{{ c.nombre }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-3 tabular-nums text-slate-600 dark:text-slate-300">{{ c.ruc }}</td>
                    <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ c.sede }}</td>
                    <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ c.telefono }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-5 py-12 text-center text-slate-400">
                      @if (cargando()) {
                        Cargando clínicas…
                      } @else {
                        Aún no hay clínicas registradas.
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </app-card>
      </main>
    </div>

    @if (mostrarRegistro()) {
      <app-registrar-clinica-modal
        (close)="mostrarRegistro.set(false)"
        (registered)="onRegistrada($event)"
      />
    }

    <app-credenciales-modal
      [credenciales]="credenciales()"
      titulo="Clínica registrada"
      mensaje="Copia estas credenciales y envíalas manualmente al cliente"
      (close)="cerrarCredenciales()"
    />
  `,
})
export class BackofficeComponent {
  private readonly auth = inject(AuthService);
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);

  readonly nombre = computed(() => this.auth.user()?.nombre ?? 'Superadmin');
  readonly mostrarRegistro = signal(false);
  readonly credenciales = signal<Credenciales | null>(null);
  readonly clinicas = signal<Clinica[]>([]);
  readonly cargando = signal(true);

  constructor() {
    this.cargarClinicas();
  }

  private cargarClinicas(): void {
    this.cargando.set(true);
    this.admin.listarClinicas().subscribe({
      next: (cs) => {
        this.clinicas.set(cs);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  abrirRegistro(): void {
    this.mostrarRegistro.set(true);
  }

  onRegistrada(cred: Credenciales): void {
    this.mostrarRegistro.set(false);
    this.credenciales.set(cred);
    // Refresca la tabla con la clínica recién creada.
    this.cargarClinicas();
  }

  cerrarCredenciales(): void {
    this.credenciales.set(null);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
