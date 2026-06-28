import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CatalogoService } from '../../core/application/services/catalogo.service';
import { ToastService } from '../../core/application/services/toast.service';
import { CATEGORIAS_PRODUCTO, Producto } from '../../core/domain/models';
import { ModalComponent } from '../../shared/ui/modal.component';
import { ButtonComponent } from '../../shared/ui/button.component';
import { IconComponent } from '../../shared/icons/icon.component';

/** Modo de apertura del modal de producto. */
export type ProductoModalMode = 'crear' | 'editar' | 'ver';

@Component({
  selector: 'app-producto-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalComponent, ButtonComponent, IconComponent],
  template: `
    <app-modal
      [open]="true"
      [title]="titulo"
      [subtitle]="subtitulo"
      size="md"
      [hasFooter]="true"
      (close)="cancelar()"
    >
      <form [formGroup]="form" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label [class]="labelClass">Código *</label>
          <input formControlName="codigo" [class]="inputClass" placeholder="Ej: MED-001" />
        </div>
        <div>
          <label [class]="labelClass">Categoría *</label>
          <select formControlName="categoria" [class]="inputClass">
            @for (c of categorias; track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select>
        </div>
        <div class="col-span-2">
          <label [class]="labelClass">Nombre *</label>
          <input formControlName="nombre" [class]="inputClass" placeholder="Nombre del producto o servicio" />
        </div>
        <div>
          <label [class]="labelClass">Precio (S/) *</label>
          <input type="number" step="0.1" formControlName="precio" [class]="inputClass" placeholder="0.00" />
          <p class="mt-1 text-xs text-slate-500">Nota: El precio introducido debe incluir el IGV</p>
        </div>
        <div>
          <label [class]="labelClass">Unidad *</label>
          <input formControlName="unidad" [class]="inputClass" placeholder="Ej: unidad, caja, ml" />
        </div>
        <div>
          <label [class]="labelClass">Stock</label>
          <input type="number" formControlName="stock" [class]="inputClass" placeholder="Vacío = servicio" />
        </div>
        <div>
          <label [class]="labelClass">Stock mínimo</label>
          <input type="number" formControlName="stockMin" [class]="inputClass" placeholder="Vacío = servicio" />
        </div>
        <p class="col-span-2 text-xs text-slate-400">
          Deja Stock y Stock mínimo vacíos para los servicios sin inventario.
        </p>
      </form>

      <div footer>
        <app-button variant="secondary" (clicked)="cancelar()">
          {{ readonly ? 'Cerrar' : 'Cancelar' }}
        </app-button>
        @if (!readonly) {
          <app-button variant="primary" (clicked)="guardar()">
            <app-icon icon name="check" [size]="16" [stroke]="2.4" />
            {{ mode === 'editar' ? 'Guardar cambios' : 'Registrar producto' }}
          </app-button>
        }
      </div>
    </app-modal>
  `,
})
export class ProductoModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly catalogo = inject(CatalogoService);
  private readonly toast = inject(ToastService);

  @Input() set mode(value: ProductoModalMode) {
    this._mode = value;
    if (value === 'ver') this.form.disable();
    else this.form.enable();
  }
  get mode(): ProductoModalMode {
    return this._mode;
  }
  private _mode: ProductoModalMode = 'crear';

  /** Producto a editar/ver; `null` o ausente para crear uno nuevo. */
  @Input() set producto(value: Producto | null | undefined) {
    this._producto = value ?? null;
    if (value) {
      this.form.patchValue({ ...value });
    }
  }
  private _producto: Producto | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly categorias = CATEGORIAS_PRODUCTO;

  readonly labelClass = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';
  readonly inputClass =
    'w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed';

  readonly form: FormGroup = this.fb.group(
    {
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      categoria: ['Medicamento', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: [''],
      stockMin: [''],
      unidad: ['unidad', Validators.required],
    },
    { validators: ProductoModalComponent.stockSegunCategoria },
  );

  /**
   * Regla de integridad de inventario (§2.7): los productos que **no** son
   * 'Servicio' exigen `stock` y `stockMin` numéricos; los servicios deben
   * dejarlos vacíos. Evita el `422` del backend validándolo en el formulario.
   */
  private static stockSegunCategoria(group: AbstractControl): ValidationErrors | null {
    const categoria = group.get('categoria')?.value;
    const stock = group.get('stock')?.value;
    const stockMin = group.get('stockMin')?.value;
    const vacio = (v: unknown) => v === '' || v === null || v === undefined;

    if (categoria === 'Servicio') {
      return vacio(stock) && vacio(stockMin) ? null : { servicioConStock: true };
    }
    return vacio(stock) || vacio(stockMin) ? { stockRequerido: true } : null;
  }

  get readonly(): boolean {
    return this.mode === 'ver';
  }

  get titulo(): string {
    switch (this.mode) {
      case 'editar':
        return 'Editar producto';
      case 'ver':
        return 'Detalle del producto';
      default:
        return 'Nuevo producto';
    }
  }

  get subtitulo(): string {
    return this.readonly ? 'Consulta de solo lectura' : 'Completa los datos del catálogo';
  }

  cancelar(): void {
    this.close.emit();
  }

  /** Convierte el valor de un input numérico opcional a number o null. */
  private toNullableNumber(v: unknown): number | null {
    if (v === '' || v === null || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.errors?.['servicioConStock']) {
        this.toast.error('Un servicio no debe llevar stock ni stock mínimo');
      } else if (this.form.errors?.['stockRequerido']) {
        this.toast.error('Indica stock y stock mínimo para productos con inventario');
      } else {
        this.toast.error('Completa los campos obligatorios del producto');
      }
      return;
    }

    const v = this.form.getRawValue();
    const datos: Omit<Producto, 'id'> = {
      codigo: v.codigo,
      nombre: v.nombre,
      categoria: v.categoria,
      precio: Number(v.precio) || 0,
      stock: this.toNullableNumber(v.stock),
      stockMin: this.toNullableNumber(v.stockMin),
      unidad: v.unidad,
    };

    const esEdicion = this.mode === 'editar' && this._producto;
    const peticion$ = esEdicion
      ? this.catalogo.actualizarProducto(this._producto!.id, datos)
      : this.catalogo.agregarProducto(datos);

    peticion$.subscribe(() => {
      this.toast.success(
        esEdicion ? `${datos.nombre} fue actualizado` : `${datos.nombre} fue agregado al catálogo`,
      );
      this.saved.emit();
      this.close.emit();
    });
  }
}
