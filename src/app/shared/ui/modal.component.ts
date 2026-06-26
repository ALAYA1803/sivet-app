import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icons/icon.component';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

/**
 * Diálogo modal. Proyecta el cuerpo por defecto y el pie con `[footer]`.
 * Solo se renderiza cuando `open` es true.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (open) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn print:static print:block print:p-0 print:bg-transparent print:backdrop-blur-none"
        (click)="close.emit()"
      >
        <div
          class="print-area bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full overflow-hidden animate-popIn print:max-w-full print:rounded-none print:shadow-none print:m-0"
          [class]="sizeClass"
          (click)="$event.stopPropagation()"
        >
          <div
            class="flex items-start justify-between px-6 py-5 border-b"
            [class]="
              dangerHeader
                ? 'border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5'
                : 'border-slate-100 dark:border-slate-800'
            "
          >
            <div>
              <h3
                class="text-lg font-semibold"
                [class]="
                  dangerHeader
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-slate-900 dark:text-slate-100'
                "
              >
                {{ title }}
              </h3>
              @if (subtitle) {
                <p class="text-sm text-slate-500 mt-0.5">{{ subtitle }}</p>
              }
            </div>
            <button
              type="button"
              (click)="close.emit()"
              class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 print:hidden"
            >
              <app-icon name="x" [size]="20" />
            </button>
          </div>
          <div class="px-6 py-5 max-h-[70vh] overflow-y-auto print:max-h-none print:overflow-visible">
            <ng-content />
          </div>
          @if (hasFooter) {
            <div
              class="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 print:hidden"
            >
              <ng-content select="[footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() size: ModalSize = 'md';
  @Input() dangerHeader = false;
  /** Indica si se debe renderizar el contenedor del pie. */
  @Input() hasFooter = false;
  @Output() close = new EventEmitter<void>();

  get sizeClass(): string {
    return SIZES[this.size];
  }
}
