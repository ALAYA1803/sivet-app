import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type AvatarTone = 'primary' | 'canino' | 'felino' | 'user';

const TONES: Record<AvatarTone, string> = {
  primary: 'bg-[var(--primary-50)] text-[var(--primary-700)]',
  canino: 'bg-amber-50 text-amber-700',
  felino: 'bg-violet-50 text-violet-700',
  user: 'bg-slate-200 text-slate-700',
};

@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rounded-full flex items-center justify-center font-semibold flex-shrink-0"
      [class]="toneClass"
      [style.width.px]="size"
      [style.height.px]="size"
      [style.fontSize.px]="size * 0.4"
    >
      {{ emoji || initials }}
    </div>
  `,
})
export class AvatarComponent {
  @Input() name = '';
  @Input() size = 36;
  @Input() tone: AvatarTone = 'primary';
  @Input() emoji = '';

  get initials(): string {
    if (!this.name) return '?';
    return this.name
      .split(' ')
      .slice(0, 2)
      .map((s) => s[0])
      .join('')
      .toUpperCase();
  }

  get toneClass(): string {
    return TONES[this.tone];
  }
}
