import { Injectable, effect, signal } from '@angular/core';

/** Controla el tema claro/oscuro alternando la clase `dark` (Tailwind darkMode: 'class'). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Clave de localStorage donde se persiste la preferencia de tema. */
  private static readonly STORAGE_KEY = 'theme';

  readonly isDark = signal(ThemeService.readStoredPreference());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      const root = document.documentElement;
      root.classList.toggle('dark', dark);
      root.style.setProperty('--bg', dark ? '#0F172A' : '#F8FAFC');
      // Recuerda la preferencia entre recargas (F5).
      localStorage.setItem(ThemeService.STORAGE_KEY, dark ? 'dark' : 'light');
    });
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
