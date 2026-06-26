import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const PADDINGS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      class="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl"
      [class]="paddingClass"
    >
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() padding: CardPadding = 'md';

  get paddingClass(): string {
    return PADDINGS[this.padding];
  }
}
