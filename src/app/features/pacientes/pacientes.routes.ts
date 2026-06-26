import { Routes } from '@angular/router';

/** Sub-rutas del módulo de pacientes (patrón maestro-detalle). */
export const PACIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/pacientes-list.component').then((m) => m.PacientesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./perfil/paciente-perfil.component').then((m) => m.PacientePerfilComponent),
  },
];
