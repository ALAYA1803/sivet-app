import { Injectable, effect, signal } from '@angular/core';

/** Controla el tema claro/oscuro alternando la clase `dark` (Tailwind darkMode: 'class'). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Clave de localStorage donde se persiste la preferencia de tema. */
  private static readonly STORAGE_KEY = 'theme';

  readonly isDark = signal(ThemeService.readStoredPreference());

  constructor() {
    // Aplica el tema de inmediato al construirse el servicio (en el arranque de
    // la app, en cualquier ruta), sin esperar al primer ciclo del effect. Así,
    // tras un F5 en /ventas u otra URL, la clase `.dark` ya está en <html>.
    this.applyTheme(this.isDark());
    // Mantiene sincronizados clase, variable de fondo y localStorage ante cada
    // cambio del signal (toggle desde Configuración, etc.).
    effect(() => this.applyTheme(this.isDark()));
  }

  /** Aplica/quita la clase `.dark` en el elemento raíz y persiste la preferencia. */
  private applyTheme(dark: boolean): void {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.setProperty('--bg', dark ? '#0F172A' : '#F8FAFC');
    // Recuerda la preferencia entre recargas (F5).
    localStorage.setItem(ThemeService.STORAGE_KEY, dark ? 'dark' : 'light');
  }

  /** Lee la preferencia guardada; por defecto, modo claro. */
  private static readStoredPreference(): boolean {
    return localStorage.getItem(ThemeService.STORAGE_KEY) === 'dark';
  }

  toggle(): void {
    this.isDark.update((v) => !v);
  }

  set(dark: boolean): void {
    this.isDark.set(dark);
  }
}
