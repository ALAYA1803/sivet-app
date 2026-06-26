import { Injectable, Signal, signal } from '@angular/core';

export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  readonly id: number;
  titulo?: string;
  mensaje: string;
  tipo: ToastTipo;
}

const AUTO_DISMISS_MS = 4000;

/** Notificaciones globales (toasts) gestionadas con Signals. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts: Signal<readonly Toast[]> = this._toasts.asReadonly();

  private seq = 0;

  show(mensaje: string, tipo: ToastTipo = 'info', titulo?: string): number {
    const id = ++this.seq;
    this._toasts.update((list) => [...list, { id, mensaje, tipo, titulo }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
    return id;
  }

  success(mensaje: string, titulo?: string): number {
    return this.show(mensaje, 'success', titulo);
  }
  error(mensaje: string, titulo?: string): number {
    return this.show(mensaje, 'error', titulo);
  }
  warning(mensaje: string, titulo?: string): number {
    return this.show(mensaje, 'warning', titulo);
  }
  info(mensaje: string, titulo?: string): number {
    return this.show(mensaje, 'info', titulo);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
