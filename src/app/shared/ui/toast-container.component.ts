import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Toast, ToastService, ToastTipo } from '../../core/application/services/toast.service';
import { IconComponent, IconName } from '../icons/icon.component';

const TONOS: Record<ToastTipo, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-slate-900 text-white',
};

const ICONOS: Record<ToastTipo, IconName> = {
  success: 'check',
  error: 'alert-triangle',
  warning: 'alert-triangle',
  info: 'bell',
};

/** Pila global de notificaciones, anclada abajo-derecha. */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">
      @for (toast of toasts(); track toast.id) {
        <div
          class="px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-md animate-slideUp cursor-pointer"
          [class]="tono(toast)"
          (click)="dismiss(toast.id)"
        >
          <app-icon [name]="icono(toast)" [size]="18" [stroke]="2.4" />
          <div>
            @if (toast.titulo) {
              <div class="text-sm font-semibold">{{ toast.titulo }}</div>
            }
            <div class="text-sm font-medium">{{ toast.mensaje }}</div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  tono(t: Toast): string {
    return TONOS[t.tipo];
  }
  icono(t: Toast): IconName {
    return ICONOS[t.tipo];
  }
  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
