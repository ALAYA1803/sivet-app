import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white shadow-sm',
  secondary:
    'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  soft: 'bg-[var(--primary-50)] hover:bg-[var(--primary-100)] text-[var(--primary-700)]',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

/**
 * Botón base. Proyecta el icono izquierdo con `[icon]`, el texto por defecto,
 * y el icono derecho con `[iconRight]`:
 *
 * <app-button variant="primary"><app-icon icon name="plus" />Nueva atención</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.block]': 'block' },
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
      class="inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      [class]="variantClass + ' ' + sizeClass + (block ? ' w-full' : '')"
    >
      <ng-content select="[icon]" />
      <ng-content />
      <ng-content select="[iconRight]" />
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  /** Ocupa todo el ancho disponible (host block + botón w-full). */
  @Input() block = false;
  @Output() clicked = new EventEmitter<MouseEvent>();

  get variantClass(): string {
    return VARIANTS[this.variant];
  }
  get sizeClass(): string {
    return SIZES[this.size];
  }
}
