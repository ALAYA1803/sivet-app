import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent, IconName } from '../icons/icon.component';

/**
 * Campo de texto base. Soporta label, hint, error e icono izquierdo.
 * Two-way friendly: `[value]` + `(valueChange)`.
 */
@Component({
  selector: 'app-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (label) {
      <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
        {{ label }}
      </label>
    }
    <div class="relative">
      @if (icon) {
        <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <app-icon [name]="icon" [size]="16" />
        </div>
      }
      <input
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        (input)="valueChange.emit($any($event.target).value)"
        class="w-full h-10 px-3 text-sm rounded-lg border bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
        [class]="
          (error ? 'border-red-300' : 'border-slate-200 dark:border-slate-700') + (icon ? ' pl-9' : '')
        "
      />
    </div>
    @if (hint && !error) {
      <p class="mt-1 text-xs text-slate-500">{{ hint }}</p>
    }
    @if (error) {
      <p class="mt-1 text-xs text-red-600">{{ error }}</p>
    }
  `,
})
export class InputComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string;
  @Input() icon?: IconName;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}
