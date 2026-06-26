import { Injectable, effect, signal } from '@angular/core';

/** Controla el tema claro/oscuro alternando la clase `dark` (Tailwind darkMode: 'class'). */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  constructor() {
    effect(() => {
      const dark = this.isDark();
      const root = document.documentElement;
      root.classList.toggle('dark', dark);
      root.style.setProperty('--bg', dark ? '#0F172A' : '#F8FAFC');
    });
  }

  toggle(): void {
    this.isDark.update((v) => !v);
  }

  set(dark: boolean): void {
    this.isDark.set(dark);
  }
}
