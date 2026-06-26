import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AgendaService } from '../../core/application/services/agenda.service';
import { PacientesService } from '../../core/application/services/pacientes.service';
import { ClientesService } from '../../core/application/services/clientes.service';
import { Cita, EstadoCita, Mascota } from '../../core/domain/models';
import { BadgeTone } from '../../shared/ui/badge.component';
import { CardComponent } from '../../shared/ui/card.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { PetAvatarComponent } from '../../shared/ui/pet-avatar.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { NuevaCitaModalComponent } from './nueva-cita-modal.component';

/** Franja del día: la hora y la cita asociada (si la hay). */
interface FranjaVista {
  hora: string;
  cita: Cita | null;
  mascota: Mascota | undefined;
  clienteNombre: string;
}

const ESTADO_TONE: Record<EstadoCita, BadgeTone> = {
  pendiente: 'info',
  completada: 'success',
  cancelada: 'danger',
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    PetAvatarComponent,
    IconComponent,
    NuevaCitaModalComponent,
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            Agenda de citas
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-1">
            {{ citasDelDia().length }} cita(s) programada(s) para el día seleccionado
          </p>
        </div>
        <app-button variant="primary" (clicked)="showModal.set(true)">
          <app-icon icon name="plus" [size]="16" [stroke]="2.4" />Agendar cita
        </app-button>
      </div>

      <!-- Navegador de día -->
      <app-card class="block mb-5">
        <div class="flex items-center justify-between">
          <button
            type="button"
            (click)="cambiarDia(-1)"
            class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <app-icon name="chevron-left" [size]="18" />
          </button>
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <app-icon name="calendar" [size]="18" class="text-[var(--primary-700)] hidden sm:block flex-shrink-0" />
            <span
              class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize truncate"
            >
              {{ fechaLarga() }}
            </span>
            <input
              type="date"
              [value]="fecha()"
              (change)="fecha.set($any($event.target).value)"
              class="h-8 px-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 focus:outline-none flex-shrink-0"
            />
          </div>
          <button
            type="button"
            (click)="cambiarDia(1)"
            class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <app-icon name="chevron-right" [size]="18" />
          </button>
        </div>
      </app-card>

      <!-- Agenda diaria por franjas -->
      <app-card padding="none">
        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (f of franjas(); track f.hora) {
            <div class="flex items-stretch">
              <div
                class="w-20 flex-shrink-0 py-3 px-4 text-sm font-medium text-slate-400 tabular-nums border-r border-slate-100 dark:border-slate-800"
              >
                {{ f.hora }}
              </div>
              @if (f.cita; as cita) {
                <div class="flex-1 p-3 flex items-center gap-3">
                  <app-pet-avatar [especie]="f.mascota?.especie ?? 'Otros'" [size]="38" />
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {{ f.mascota?.nombre ?? 'Paciente' }}
                      <span class="font-normal text-slate-500">· {{ f.clienteNombre }}</span>
                    </div>
                    <div class="text-xs text-slate-500">{{ cita.motivo }}</div>
                  </div>
                  <app-badge [tone]="estadoTone(cita.estado)" class="capitalize">
                    {{ cita.estado }}
                  </app-badge>
                </div>
              } @else {
                <button
                  type="button"
                  (click)="agendarEn()"
                  class="flex-1 p-3 text-left text-sm text-slate-300 dark:text-slate-600 hover:text-[var(--primary-700)] hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  Disponible
                </button>
              }
            </div>
          }
        </div>
      </app-card>
    </div>

    @if (showModal()) {
      <app-nueva-cita-modal (close)="showModal.set(false)" (saved)="onCitaCreada($event)" />
    }
  `,
})
export class AgendaComponent {
  private readonly agenda = inject(AgendaService);
  private readonly pacientes = inject(PacientesService);
  private readonly clientes = inject(ClientesService);
  private readonly router = inject(Router);

  readonly fecha = signal(this.hoyISO());
  readonly showModal = signal(false);

  /** Citas del día seleccionado (no canceladas se muestran con su estado). */
  readonly citasDelDia = computed<Cita[]>(() =>
    this.agenda.citas().filter((c) => c.fecha === this.fecha()),
  );

  /** Franjas horarias del día con su cita asociada (si existe). */
  readonly franjas = computed<FranjaVista[]>(() => {
    const delDia = this.citasDelDia();
    return this.agenda.horarios.map((hora) => {
      const cita = delDia.find((c) => c.hora === hora && c.estado !== 'cancelada') ?? null;
      const mascota = cita ? this.pacientes.getMascota(cita.mascotaId) : undefined;
      const clienteNombre = cita
        ? (this.clientes.getById(cita.clienteId)?.nombre ?? '')
        : '';
      return { hora, cita, mascota, clienteNombre };
    });
  });

  readonly fechaLarga = computed(() =>
    new Date(this.fecha() + 'T00:00:00').toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  private hoyISO(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  estadoTone(estado: EstadoCita): BadgeTone {
    return ESTADO_TONE[estado];
  }

  cambiarDia(delta: number): void {
    const d = new Date(this.fecha() + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    this.fecha.set(`${d.getFullYear()}-${mm}-${dd}`);
  }

  agendarEn(): void {
    this.showModal.set(true);
  }

  onCitaCreada(fecha: string): void {
    this.fecha.set(fecha);
  }
}
