import { ChangeDetectionStrategy, Component, Input, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClientesService } from '../../../core/application/services/clientes.service';
import { PacientesService } from '../../../core/application/services/pacientes.service';
import { IconName } from '../../../shared/icons/icon.component';
import { BadgeTone } from '../../../shared/ui/badge.component';
import { TipoAtencion } from '../../../core/domain/models';
import { CardComponent } from '../../../shared/ui/card.component';
import { BadgeComponent } from '../../../shared/ui/badge.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { AvatarComponent } from '../../../shared/ui/avatar.component';
import { PetAvatarComponent } from '../../../shared/ui/pet-avatar.component';
import { IconComponent } from '../../../shared/icons/icon.component';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { RecetasTabComponent } from './tabs/recetas-tab.component';
import { EstudiosTabComponent } from './tabs/estudios-tab.component';
import { VentasMascotaTabComponent } from './tabs/ventas-mascota-tab.component';

type TabId = 'historia' | 'recetas' | 'imagenes' | 'ventas';

interface Tab {
  id: TabId;
  label: string;
  icon: IconName;
}

const TIPO_ICON: Record<TipoAtencion, IconName> = {
  'Consulta general': 'stethoscope',
  Vacunación: 'syringe',
  Desparasitación: 'pill',
  Cirugía: 'scissors',
};

const TIPO_TONE: Record<TipoAtencion, BadgeTone> = {
  'Consulta general': 'info',
  Vacunación: 'success',
  Desparasitación: 'purple',
  Cirugía: 'warning',
};

const TIPO_NODE: Record<TipoAtencion, string> = {
  'Consulta general': 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  Vacunación: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Cirugía: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Desparasitación: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
};

@Component({
  selector: 'app-paciente-perfil',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    AvatarComponent,
    PetAvatarComponent,
    IconComponent,
    FechaPipe,
    RecetasTabComponent,
    EstudiosTabComponent,
    VentasMascotaTabComponent,
  ],
  templateUrl: './paciente-perfil.component.html',
})
export class PacientePerfilComponent {
  private readonly pacientes = inject(PacientesService);
  private readonly clientes = inject(ClientesService);
  private readonly router = inject(Router);

  private readonly _id = signal('');

  /** Vinculado al parámetro de ruta `:id` vía withComponentInputBinding. */
  @Input({ required: true }) set id(value: string) {
    this._id.set(value);
  }

  readonly tab = signal<TabId>('historia');

  readonly tabs: Tab[] = [
    { id: 'historia', label: 'Historia clínica', icon: 'activity' },
    { id: 'recetas', label: 'Recetas', icon: 'pill' },
    { id: 'imagenes', label: 'Estudios', icon: 'image' },
    { id: 'ventas', label: 'Ventas', icon: 'receipt' },
  ];

  readonly mascotaId = this._id.asReadonly();
  readonly mascota = computed(() => this.pacientes.getMascota(this._id()));
  readonly cliente = computed(() => {
    const m = this.mascota();
    return m ? this.clientes.getById(m.clienteId) : undefined;
  });
  readonly atenciones = computed(() => this.pacientes.getHistoria(this._id()));

  tipoIcon(tipo: TipoAtencion): IconName {
    return TIPO_ICON[tipo] ?? 'activity';
  }
  tipoTone(tipo: TipoAtencion): BadgeTone {
    return TIPO_TONE[tipo] ?? 'neutral';
  }
  nodeClass(tipo: TipoAtencion): string {
    return TIPO_NODE[tipo] ?? TIPO_NODE['Desparasitación'];
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }
  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
