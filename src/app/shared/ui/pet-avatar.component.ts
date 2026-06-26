import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Especie } from '../../core/domain/models';
import { IconComponent } from '../icons/icon.component';

/** Avatar/ícono de mascota, coloreado según especie. */
@Component({
  selector: 'app-pet-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div
      class="rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white dark:ring-slate-800"
      [class]="toneClass"
      [style.width.px]="size"
      [style.height.px]="size"
    >
      <app-icon name="paw" [size]="size * 0.5" [stroke]="2" />
    </div>
  `,
})
export class PetAvatarComponent {
  @Input({ required: true }) especie!: Especie;
  @Input() size = 40;

  get toneClass(): string {
    switch (this.especie) {
      case 'Canino':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
      case 'Felino':
        return 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300';
      default:
        return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300';
    }
  }
}
