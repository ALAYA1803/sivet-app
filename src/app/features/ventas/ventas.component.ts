import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ClientesService } from '../../core/application/services/clientes.service';
import { PosService } from '../../core/application/services/pos.service';
import { ToastService } from '../../core/application/services/toast.service';
import { ExportService } from '../../core/application/services/export.service';
import { Cliente, MetodoPago, Venta } from '../../core/domain/models';
import { BadgeTone } from '../../shared/ui/badge.component';
import { CardComponent } from '../../shared/ui/card.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { SolesPipe } from '../../shared/pipes/soles.pipe';
import { FechaPipe } from '../../shared/pipes/fecha.pipe';
import { AnularVentaModalComponent } from './components/anular-venta-modal.component';
import { DetalleVentaModalComponent } from './components/detalle-venta-modal.component';
import { formatVentaId } from './venta-id.util';

type EstadoFiltro = 'todas' | 'completada' | 'anulada';

interface EstadoOption {
  value: EstadoFiltro;
  label: string;
}

interface VentaRow {
  venta: Venta;
  cliente: Cliente | undefined;
}

const METODO_TONE: Record<MetodoPago, BadgeTone> = {
  Yape: 'purple',
  Plin: 'info',
  Tarjeta: 'primary',
  Efectivo: 'success',
};

@Component({
  selector: 'app-ventas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    AvatarComponent,
    IconComponent,
    SolesPipe,
    FechaPipe,
    AnularVentaModalComponent,
    DetalleVentaModalComponent,
  ],
  templateUrl: './ventas.component.html',
})
export class VentasComponent {
  private readonly pos = inject(PosService);
  private readonly clientes = inject(ClientesService);
  private readonly toast = inject(ToastService);
  private readonly exporter = inject(ExportService);
  private readonly router = inject(Router);

  readonly search = signal('');
  readonly estado = signal<EstadoFiltro>('todas');

  readonly ventaAnular = signal<Venta | null>(null);
  readonly ventaVer = signal<Venta | null>(null);

  readonly estados: EstadoOption[] = [
    { value: 'todas', label: 'Todas' },
    { value: 'completada', label: 'Completadas' },
    { value: 'anulada', label: 'Anuladas' },
  ];

  /** Ventas enriquecidas con su cliente, ordenadas de más reciente a más antigua. */
  private readonly enriched = computed<VentaRow[]>(() =>
    this.pos
      .ventas()
      .map((venta) => ({ venta, cliente: this.clientes.getById(venta.clienteId) }))
      .sort((a, b) => b.venta.fecha.localeCompare(a.venta.fecha)),
  );

  readonly filtered = computed<VentaRow[]>(() => {
    const est = this.estado();
    const q = this.search().trim().toLowerCase();
    return this.enriched().filter(({ venta, cliente }) => {
      if (est !== 'todas' && venta.estado !== est) return false;
      if (!q) return true;
      return (
        venta.id.toLowerCase().includes(q) ||
        (cliente?.nombre.toLowerCase().includes(q) ?? false) ||
        (cliente?.dni.includes(q) ?? false)
      );
    });
  });

  // --- Stats ---
  private readonly completadas = computed(() =>
    this.enriched().filter((r) => r.venta.estado === 'completada'),
  );
  readonly ingresosTotales = computed(() =>
    this.completadas().reduce((s, r) => s + r.venta.total, 0),
  );
  readonly totalCompletadas = computed(() => this.completadas().length);
  readonly ticketPromedio = computed(() => {
    const n = this.totalCompletadas();
    return n > 0 ? this.ingresosTotales() / n : 0;
  });
  readonly totalAnuladas = computed(
    () => this.enriched().filter((r) => r.venta.estado === 'anulada').length,
  );

  formatId(id: string): string {
    return formatVentaId(id);
  }
  nombreCorto(nombre: string | undefined): string {
    return nombre ? nombre.split(' ').slice(0, 2).join(' ') : '';
  }
  detalle(venta: Venta): string {
    return venta.items.map((i) => i.nombre).join(', ');
  }
  metodoTone(metodo: MetodoPago): BadgeTone {
    return METODO_TONE[metodo];
  }

  confirmarAnulacion(motivo: string): void {
    const venta = this.ventaAnular();
    if (!venta) return;
    this.pos.anularVenta(venta.id, motivo);
    this.ventaAnular.set(null);
    this.toast.success('Venta anulada · Inventario restaurado');
  }

  nuevaVenta(): void {
    this.router.navigate(['/pos']);
  }

  exportar(): void {
    this.exporter.exportToPDF(this.filtered(), 'reporte-ventas');
  }
}
