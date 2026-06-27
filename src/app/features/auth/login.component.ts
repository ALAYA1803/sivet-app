import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/application/services/auth.service';
import { ToastService } from '../../core/application/services/toast.service';
import { IconComponent } from '../../shared/icons/icon.component';

/**
 * Formulario reactivo de inicio de sesión. Pide credencial (usuario) y
 * contraseña; al autenticar delega en {@link AuthService} (POST /auth/login)
 * y redirige a la URL guardada en `returnUrl` (o al dashboard).
 */
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    <header class="mb-8 text-center">
      <img src="/logo-sivet-negro.png" alt="SIVET" class="mx-auto h-14 w-auto dark:invert" />
      <h1 class="mt-5 text-2xl font-bold text-slate-900 dark:text-slate-100">Bienvenido de vuelta</h1>
      <p class="mt-1 text-sm text-slate-500">Ingresa tus credenciales para acceder al sistema.</p>
    </header>

    @if (errorMsg()) {
      <div
        class="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
      >
        <app-icon name="alert-triangle" [size]="16" class="mt-0.5 shrink-0" />
        <span>{{ errorMsg() }}</span>
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
      <!-- Usuario / credencial -->
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Usuario
        </label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <app-icon name="users" [size]="16" />
          </div>
          <input
            formControlName="credencial"
            autocomplete="username"
            placeholder="Tu usuario o credencial"
            [class]="inputClass(invalid('credencial'))"
          />
        </div>
        @if (invalid('credencial')) {
          <p class="mt-1 text-xs text-red-600">Ingresa tu usuario.</p>
        }
      </div>

      <!-- Contraseña -->
      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <label class="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Contraseña
          </label>
          <a
            routerLink="/forgot-password"
            class="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-600)]"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div class="relative">
          <input
            formControlName="password"
            [type]="showPassword() ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            [class]="inputClass(invalid('password')) + ' pr-10'"
          />
          <button
            type="button"
            (click)="showPassword.set(!showPassword())"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <app-icon name="eye" [size]="16" />
          </button>
        </div>
        @if (invalid('password')) {
          <p class="mt-1 text-xs text-red-600">Ingresa tu contraseña.</p>
        }
      </div>

      <button
        type="submit"
        [disabled]="loading()"
        class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] font-medium text-white shadow-sm transition-colors hover:bg-[var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        @if (loading()) {
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Ingresando…
        } @else {
          Iniciar sesión
        }
      </button>
    </form>

    <p class="mt-8 rounded-lg bg-slate-50 px-3 py-2.5 text-center text-xs text-slate-500 dark:bg-slate-800/60">
      Demo: <span class="font-medium text-slate-700 dark:text-slate-300">admin</span> /
      <span class="font-medium text-slate-700 dark:text-slate-300">admin123</span>
    </p>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    credencial: ['', Validators.required],
    password: ['', Validators.required],
  });

  invalid(control: 'credencial' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  inputClass(error: boolean): string {
    const base =
      'w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';
    return base + (error ? ' border-red-300' : ' border-slate-200 dark:border-slate-700');
  }

  submit(): void {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: (session) => {
        // Primer login: cambio de contraseña temporal obligatorio antes que nada.
        if (this.auth.requierePasswordChange()) {
          this.router.navigateByUrl('/auth/cambiar-password');
          return;
        }
        this.toast.show(`Hola, ${session.payload.nombre}`, 'success');
        // El SUPERADMIN va a su panel; el resto, a la URL de retorno o al dashboard.
        if (this.auth.isSuperAdmin()) {
          this.router.navigateByUrl('/backoffice');
          return;
        }
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMsg.set(err.message);
      },
    });
  }
}
