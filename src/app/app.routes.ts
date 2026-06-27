import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './features/auth/auth-layout.component';
import { authGuard } from './core/infrastructure/guards/auth.guard';
import { publicGuard } from './core/infrastructure/guards/public.guard';
import { superAdminGuard } from './core/infrastructure/guards/superadmin.guard';
import { passwordChangeGuard } from './core/infrastructure/guards/password-change.guard';

export const routes: Routes = [
  // Cambio obligatorio de contraseña temporal (primer login). Va dentro del
  // layout de auth pero fuera del publicGuard: requiere sesión + bandera activa.
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'cambiar-password',
        canActivate: [passwordChangeGuard],
        loadComponent: () =>
          import('./features/auth/cambiar-password.component').then(
            (m) => m.CambiarPasswordComponent,
          ),
      },
    ],
  },
  // Panel maestro (SUPERADMIN), protegido por su propio guard de rol.
  {
    path: 'backoffice',
    canActivate: [superAdminGuard],
    loadComponent: () =>
      import('./features/backoffice/backoffice.component').then((m) => m.BackofficeComponent),
  },
  // Bloque público: login / recuperar contraseña. Si ya hay sesión activa,
  // el publicGuard redirige al destino real según rol/estado.
  {
    path: '',
    canActivate: [publicGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // Bloque privado: todo el MainLayout queda protegido por el authGuard.
  // Sin sesión, redirige a /login conservando la URL de retorno.
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'pacientes',
        loadChildren: () =>
          import('./features/pacientes/pacientes.routes').then((m) => m.PACIENTES_ROUTES),
      },
      {
        path: 'atencion',
        loadComponent: () =>
          import('./features/atencion/atencion.component').then((m) => m.AtencionComponent),
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./features/agenda/agenda.component').then((m) => m.AgendaComponent),
      },
      {
        path: 'pos',
        loadComponent: () => import('./features/pos/pos.component').then((m) => m.PosComponent),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas.component').then((m) => m.VentasComponent),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./features/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes.component').then((m) => m.ClientesComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reportes/reportes.component').then((m) => m.ReportesComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/configuracion/configuracion.component').then(
            (m) => m.ConfiguracionComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
