import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClientesService } from '../../core/application/services/clientes.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { Cliente, Mascota } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { InputComponent } from '../../shared/ui/input.component';
import { IconComponent } from '../../shared/icons/icon.component';

/** Cliente enriquecido con sus mascotas para la tabla. */
interface ClienteRow {
  cliente: Cliente;
  mascotas: Mascota[];
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, BadgeComponent, InputComponent, IconComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="flex items-end justify-between mb-7">
        <div>
          <h1 class="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Clientes
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">
            {{ total() }} dueños registrados en SIVET
          </p>
        </div>
      </div>

      <!-- Buscador reactivo -->
      <div class="mb-5 max-w-md">
        <app-input
          icon="search"
          placeholder="Buscar por nombre, DNI, teléfono o email..."
          [value]="search()"
          (valueChange)="search.set($event)"
        />
      </div>

      <app-card padding="none">
        <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr
              class="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700"
            >
              <th class="px-5 py-3">Cliente</th>
              <th class="px-5 py-3">DNI</th>
              <th class="px-5 py-3">Contacto</th>
              <th class="px-5 py-3">Dirección</th>
              <th class="px-5 py-3">Mascotas</th>
            </tr>
          </thead>
          <tbody>
            @for (row of filtered(); track row.cliente.id) {
              <tr
                class="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td class="px-5 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-full bg-[var(--primary-50)] text-[var(--primary-700)] flex items-center justify-center font-semibold text-xs flex-shrink-0"
                    >
                      {{ iniciales(row.cliente.nombre) }}
                    </div>
                    <span class="font-medium text-slate-900 dark:text-slate-100">
                      {{ row.cliente.nombre }}
                    </span>
                  </div>
                </td>
                <td class="px-5 py-3 tabular-nums text-slate-600 dark:text-slate-300">
                  {{ row.cliente.dni }}
                </td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300">
                  <div class="flex items-center gap-1.5">
                    <app-icon name="phone" [size]="13" class="text-slate-400" />
                    {{ row.cliente.telefono }}
                  </div>
                  <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <app-icon name="mail" [size]="13" />
                    {{ row.cliente.email }}
                  </div>
                </td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300 max-w-[220px] truncate">
                  {{ row.cliente.direccion }}
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <app-badge tone="primary">
                      <app-icon name="paw" [size]="12" />
                      {{ row.mascotas.length }}
                    </app-badge>
                    <span class="text-xs text-slate-400 truncate max-w-[160px]">
                      {{ nombresMascotas(row.mascotas) }}
                    </span>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-5 py-12 text-center text-slate-400">
                  No se encontraron clientes con ese criterio
                </td>
              </tr>
            }
          </tbody>
        </table>
        </div>
      </app-card>
    </div>
  `,
})
export class ClientesComponent {
  private readonly clientes = inject(ClientesService);
  private readonly pacientes = inject(PacientesService);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly total = this.clientes.total;

  /** Clientes enriquecidos con sus mascotas. */
  private readonly rows = computed<ClienteRow[]>(() =>
    this.clientes.clientes().map((cliente) => ({
      cliente,
      mascotas: this.pacientes.getMascotasByCliente(cliente.id),
    })),
  );

  /** Lista filtrada reactiva por el buscador. */
  readonly filtered = computed<ClienteRow[]>(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.rows();
    return this.rows().filter(
      ({ cliente }) =>
        cliente.nombre.toLowerCase().includes(q) ||
        cliente.dni.includes(q) ||
        cliente.telefono.includes(q) ||
        cliente.email.toLowerCase().includes(q),
    );
  });

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase();
  }

  nombresMascotas(mascotas: Mascota[]): string {
    return mascotas.map((m) => m.nombre).join(', ') || 'Sin mascotas';
  }
}
