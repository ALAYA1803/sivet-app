import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogoService } from '../../core/application/services/catalogo.service';
import { ClientesService } from '../../core/application/services/clientes.service';
import { PosService } from '../../core/application/services/pos.service';
import { ToastService } from '../../core/application/services/toast.service';
import { MetodoPago, Producto } from '../../core/domain/models';
import { CardComponent } from '../../shared/ui/card.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { InputComponent } from '../../shared/ui/input.component';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { SolesPipe } from '../../shared/pipes/soles.pipe';

/** Línea del carrito local del POS. */
interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number | null;
}

interface MetodoPagoOption {
  id: MetodoPago;
  icon: string;
}

@Component({
  selector: 'app-pos',
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
  ],
  templateUrl: './pos.component.html',
})
export class PosComponent {
  private readonly catalogo = inject(CatalogoService);
  private readonly clientes = inject(ClientesService);
  private readonly pos = inject(PosService);
  private readonly toast = inject(ToastService);
  private readonly soles = new SolesPipe();
  private readonly router = inject(Router);

  // --- Filtros del catálogo ---
  readonly search = signal('');
  readonly categoria = signal('Todos');
  readonly categorias = [
    'Todos',
    'Servicio',
    'Medicamento',
    'Vacuna',
    'Alimento',
    'Antiparasitario',
    'Antiinflamatorio',
    'Accesorio',
  ];

  // --- Estado del carrito / cobro ---
  readonly carrito = signal<CartItem[]>([]);
  readonly clienteId = signal('');
  readonly metodoPago = signal<MetodoPago>('Efectivo');
  readonly recibido = signal('');
  readonly showClientePicker = signal(false);
  readonly clienteSearch = signal('');

  readonly metodosPago: MetodoPagoOption[] = [
    { id: 'Efectivo', icon: '💵' },
    { id: 'Tarjeta', icon: '💳' },
    { id: 'Yape', icon: '📱' },
    { id: 'Plin', icon: '📲' },
  ];

  readonly cliente = computed(() => this.clientes.getById(this.clienteId()));

  readonly filtered = computed<Producto[]>(() => {
    const cat = this.categoria();
    const q = this.search().trim().toLowerCase();
    return this.catalogo.productos().filter((p) => {
      if (cat !== 'Todos' && p.categoria !== cat) return false;
      if (!q) return true;
      return p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q);
    });
  });

  readonly filteredClientes = computed(() => {
    const q = this.clienteSearch().trim().toLowerCase();
    return this.clientes
      .clientes()
      .filter((c) => !q || c.nombre.toLowerCase().includes(q) || c.dni.includes(q))
      .slice(0, 5);
  });

  // --- Totales en tiempo real ---
  readonly subtotal = computed(() =>
    this.carrito().reduce((s, i) => s + i.precio * i.cantidad, 0),
  );
  /** IGV (18%) incluido en el precio. */
  readonly igv = computed(() => (this.subtotal() * 0.18) / 1.18);
  readonly total = this.subtotal;
  readonly cambio = computed(() => {
    const r = parseFloat(this.recibido());
    return isNaN(r) ? 0 : r - this.total();
  });

  // --- Helpers de UI ---
  sinStock(p: Producto): boolean {
    return p.stock !== null && p.stock === 0;
  }
  stockBajo(p: Producto): boolean {
    return p.stock !== null && p.stockMin !== null && p.stock <= p.stockMin && p.stock > 0;
  }
  categoriaBg(categoria: string): string {
    switch (categoria) {
      case 'Servicio':
        return 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300';
      case 'Vacuna':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
      case 'Alimento':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
      case 'Accesorio':
        return 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300';
      default:
        return 'bg-[var(--primary-50)] text-[var(--primary-700)]';
    }
  }

  // --- Acciones del carrito ---
  addAlCarrito(p: Producto): void {
    if (this.sinStock(p)) return;
    this.carrito.update((c) => {
      const exists = c.find((i) => i.id === p.id);
      if (exists) {
        return c.map((i) => (i.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i));
      }
      return [...c, { id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1, stock: p.stock }];
    });
  }

  updCantidad(id: string, delta: number): void {
    this.carrito.update((c) =>
      c.map((i) => (i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)),
    );
  }

  removeItem(id: string): void {
    this.carrito.update((c) => c.filter((i) => i.id !== id));
  }

  limpiar(): void {
    this.carrito.set([]);
  }

  seleccionarCliente(id: string): void {
    this.clienteId.set(id);
    this.showClientePicker.set(false);
    this.clienteSearch.set('');
  }

  cobrar(): void {
    if (this.carrito().length === 0) return;
    const total = this.total();
    this.pos.registrarVenta({
      fecha: new Date().toISOString(),
      clienteId: this.clienteId() || 'c1',
      items: this.carrito().map((i) => ({
        productoId: i.id,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precio: i.precio,
      })),
      total: this.total(),
      metodoPago: this.metodoPago(),
      vendedor: 'Lucía Paredes',
    });
    this.carrito.set([]);
    this.clienteId.set('');
    this.recibido.set('');
    this.toast.success(`Venta de ${this.soles.transform(total)} registrada correctamente`);
  }

  verHistorial(): void {
    this.router.navigate(['/ventas']);
  }
}
