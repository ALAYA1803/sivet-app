import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/application/services/auth.service';
import { IconComponent } from '../../shared/icons/icon.component';

/**
 * Formulario simple para solicitar la recuperación de contraseña. No revela
 * si la cuenta existe: tras enviar muestra siempre un estado de confirmación.
 * El administrador del sistema gestiona el restablecimiento real.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  template: `
    @if (sent()) {
      <!-- Estado de confirmación -->
      <div class="text-center">
        <div
          class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
        >
          <app-icon name="check" [size]="24" />
        </div>
        <h1 class="mt-5 text-2xl font-bold text-slate-900 dark:text-slate-100">Revisa tu correo</h1>
        <p class="mt-2 text-sm text-slate-500">
          Si <span class="font-medium text-slate-700 dark:text-slate-300">{{ form.value.credencial }}</span>
          corresponde a una cuenta, le enviamos las instrucciones para restablecer la contraseña.
        </p>
        <a
          routerLink="/login"
          class="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] font-medium text-white shadow-sm transition-colors hover:bg-[var(--primary-600)]"
        >
          Volver al inicio de sesión
        </a>
      </div>
    } @else {
      <header class="mb-8 text-center">
        <img src="/logo-sivet-negro.png" alt="SIVET" class="mx-auto h-14 w-auto dark:invert" />
        <h1 class="mt-5 text-2xl font-bold text-slate-900 dark:text-slate-100">Recuperar contraseña</h1>
        <p class="mt-1 text-sm text-slate-500">
          Ingresa tu usuario o correo y te enviaremos un enlace para restablecerla.
        </p>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <div>
          <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Usuario o correo
          </label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <app-icon name="mail" [size]="16" />
            </div>
            <input
              formControlName="credencial"
              autocomplete="username"
              placeholder="Tu usuario o correo"
              [class]="inputClass"
            />
          </div>
          @if (invalid) {
            <p class="mt-1 text-xs text-red-600">Ingresa tu usuario o correo.</p>
          }
        </div>

        <button
          type="submit"
          [disabled]="loading()"
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] font-medium text-white shadow-sm transition-colors hover:bg-[var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading() ? 'Enviando…' : 'Enviar instrucciones' }}
        </button>
      </form>

      <a
        routerLink="/login"
        class="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <app-icon name="arrow-right" [size]="15" class="rotate-180" />
        Volver al inicio de sesión
      </a>
    }
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    credencial: ['', Validators.required],
  });

  readonly inputClass =
    'w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';

  get invalid(): boolean {
    const c = this.form.controls.credencial;
    return c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth.requestPasswordReset(this.form.getRawValue().credencial).subscribe(() => {
      this.loading.set(false);
      this.sent.set(true);
    });
  }
}
