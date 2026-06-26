import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CatalogoService } from '../../core/application/services/catalogo.service';
import { Producto } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { SolesPipe } from '../../shared/pipes/soles.pipe';
import { ExportService } from '../../core/application/services/export.service';
import { ProductoModalComponent, ProductoModalMode } from './producto-modal.component';

type StockFilter = 'todos' | 'critico' | 'agotado';

interface StockFilterOption {
  value: StockFilter;
  label: string;
}

/** Producto con flags de estado de stock ya calculados para la tabla. */
interface ProductoRow {
  producto: Producto;
  sinStock: boolean;
  stockBajo: boolean;
  pct: number;
}

@Component({
  selector: 'app-catalogo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    IconComponent,
    SolesPipe,
    ProductoModalComponent,
  ],
  templateUrl: './catalogo.component.html',
})
export class CatalogoComponent {
  private readonly catalogo = inject(CatalogoService);
  private readonly exporter = inject(ExportService);

  readonly search = signal('');
  readonly categoria = signal('Todos');
  readonly stockFilter = signal<StockFilter>('todos');

  // --- Modal de producto ---
  readonly modalOpen = signal(false);
  readonly modalMode = signal<ProductoModalMode>('crear');
  readonly modalProducto = signal<Producto | null>(null);

  readonly stockFilters: StockFilterOption[] = [
    { value: 'todos', label: 'Todo el stock' },
    { value: 'critico', label: 'Stock crítico' },
    { value: 'agotado', label: 'Agotado' },
  ];

  readonly productos = this.catalogo.productos;

  readonly categorias = computed(() => [
    'Todos',
    ...Array.from(new Set(this.catalogo.productos().map((p) => p.categoria))),
  ]);

  // --- Stats ---
  readonly totalProductos = computed(() => this.catalogo.productos().length);
  readonly valorInventario = computed(() =>
    this.catalogo.productos().reduce((s, p) => s + (p.stock ?? 0) * p.precio, 0),
  );
  readonly stockCritico = computed(() => this.catalogo.stockCriticos().length);

  /** Lista filtrada reactiva (texto + categoría + estado de stock). */
  readonly filtered = computed<ProductoRow[]>(() => {
    const cat = this.categoria();
    const stockF = this.stockFilter();
    const q = this.search().trim().toLowerCase();

    return this.catalogo
      .productos()
      .filter((p) => {
        if (cat !== 'Todos' && p.categoria !== cat) return false;
        if (stockF === 'critico' && !(p.stock !== null && p.stockMin !== null && p.stock <= p.stockMin))
          return false;
        if (stockF === 'agotado' && !(p.stock !== null && p.stock === 0)) return false;
        if (!q) return true;
        return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q);
      })
      .map((producto) => {
        const sinStock = producto.stock !== null && producto.stock === 0;
        const stockBajo =
          producto.stock !== null &&
          producto.stockMin !== null &&
          producto.stock <= producto.stockMin &&
          producto.stock > 0;
        const pct =
          producto.stock !== null && producto.stockMin
            ? Math.min((producto.stock / (producto.stockMin * 2)) * 100, 100)
            : 100;
        return { producto, sinStock, stockBajo, pct };
      });
  });

  // --- Acciones del modal ---
  nuevoProducto(): void {
    this.modalProducto.set(null);
    this.modalMode.set('crear');
    this.modalOpen.set(true);
  }

  editarProducto(producto: Producto): void {
    this.modalProducto.set(producto);
    this.modalMode.set('editar');
    this.modalOpen.set(true);
  }

  verProducto(producto: Producto): void {
    this.modalProducto.set(producto);
    this.modalMode.set('ver');
    this.modalOpen.set(true);
  }

  cerrarModal(): void {
    this.modalOpen.set(false);
  }

  exportar(): void {
    this.exporter.exportToExcel(this.catalogo.productos(), 'catalogo-inventario');
  }
}
