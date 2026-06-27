import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Layout de autenticación minimalista: fondo gris muy sutil con el formulario
 * centrado en una tarjeta tipo modal. El `<router-outlet>` proyecta el
 * contenido (login / recuperar contraseña).
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div
        class="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-900/5 dark:ring-slate-100/10 p-8 sm:p-10"
      >
        <router-outlet />
      </div>
      <footer class="fixed bottom-4 inset-x-0 text-center text-xs text-slate-400">
        © {{ year }} SIVET · Sistema Integral Veterinario
      </footer>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly year = new Date().getFullYear();
}
