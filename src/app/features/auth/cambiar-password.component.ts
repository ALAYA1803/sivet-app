import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/application/services/auth.service';
import { ToastService } from '../../core/application/services/toast.service';
import { IconComponent } from '../../shared/icons/icon.component';

/**
 * Cambio obligatorio de la contraseña temporal en el primer inicio de sesión.
 * Solo pide la nueva contraseña y su confirmación (coincidencia + longitud);
 * al confirmarse (`POST /usuarios/cambiar-password-inicial`) libera el acceso y
 * redirige al destino real del usuario.
 */
@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent],
  template: `
    <header class="mb-8 text-center">
      <div
        class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-50)] text-[var(--primary-700)]"
      >
        <app-icon name="key" [size]="24" />
      </div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Crea tu contraseña</h1>
      <p class="mt-1 text-sm text-slate-500">
        Por seguridad, define una contraseña nueva para reemplazar la temporal.
      </p>
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
      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Nueva contraseña
        </label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <app-icon name="lock" [size]="16" />
          </div>
          <input
            formControlName="nuevaPassword"
            [type]="show() ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Mínimo 8 caracteres"
            [class]="inputClass(invalid('nuevaPassword')) + ' pr-10'"
          />
          <button
            type="button"
            (click)="show.set(!show())"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            [attr.aria-label]="show() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
          >
            <app-icon name="eye" [size]="16" />
          </button>
        </div>
        @if (invalid('nuevaPassword')) {
          <p class="mt-1 text-xs text-red-600">La contraseña debe tener al menos 8 caracteres.</p>
        }
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
          Confirmar contraseña
        </label>
        <div class="relative">
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <app-icon name="lock" [size]="16" />
          </div>
          <input
            formControlName="confirmar"
            [type]="show() ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Repite la contraseña"
            [class]="inputClass(noCoincide()) + ' pr-10'"
          />
        </div>
        @if (noCoincide()) {
          <p class="mt-1 text-xs text-red-600">Las contraseñas no coinciden.</p>
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
          Guardando…
        } @else {
          Guardar y continuar
        }
      </button>
    </form>
  `,
})
export class CambiarPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly show = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      nuevaPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmar: ['', Validators.required],
    },
    { validators: CambiarPasswordComponent.passwordsCoinciden },
  );

  private static passwordsCoinciden(group: AbstractControl): ValidationErrors | null {
    const a = group.get('nuevaPassword')?.value;
    const b = group.get('confirmar')?.value;
    return a && b && a !== b ? { noCoincide: true } : null;
  }

  invalid(control: 'nuevaPassword' | 'confirmar'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  inputClass(error: boolean): string {
    const base =
      'w-full h-10 pl-9 pr-3 text-sm rounded-lg border bg-white dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]';
    return base + (error ? ' border-red-300' : ' border-slate-200 dark:border-slate-700');
  }

  noCoincide(): boolean {
    const c = this.form.controls.confirmar;
    return this.form.hasError('noCoincide') && (c.touched || c.dirty);
  }

  submit(): void {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.auth.cambiarPasswordInicial(this.form.getRawValue().nuevaPassword).subscribe({
      next: () => {
        this.toast.success('Contraseña actualizada correctamente');
        const destino = this.auth.isSuperAdmin() ? '/backoffice' : '/dashboard';
        this.router.navigateByUrl(destino);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('No se pudo actualizar la contraseña. Inténtalo de nuevo.');
      },
    });
  }
}
