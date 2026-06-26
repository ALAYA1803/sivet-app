import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent, IconName } from '../icons/icon.component';
import { ButtonComponent } from './button.component';

/** Estado vacío reutilizable con icono, mensaje y CTA opcional. */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, ButtonComponent],
  template: `
    <div class="text-center py-20">
      <div
        class="w-20 h-20 rounded-2xl bg-[var(--primary-50)] text-[var(--primary-700)] flex items-center justify-center mx-auto mb-4"
      >
        <app-icon [name]="icon" [size]="32" />
      </div>
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{{ message }}</p>
      @if (cta) {
        <app-button variant="primary" class="inline-block mt-5" (clicked)="ctaClick.emit()">
          <app-icon icon name="plus" [size]="16" [stroke]="2.4" />{{ cta }}
        </app-button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input({ required: true }) icon!: IconName;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() cta?: string;
  @Output() ctaClick = new EventEmitter<void>();
}
