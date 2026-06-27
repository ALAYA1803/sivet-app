/** Roles asignables al personal de una clínica (no incluye al administrador). */
export const ROLES_EMPLEADO = ['Veterinario', 'Recepcionista'] as const;
export type RolEmpleado = (typeof ROLES_EMPLEADO)[number];

/** Empleado de la clínica (personal con acceso al sistema). */
export interface Empleado {
  id: string;
  nombre: string;
  username: string;
  rol: string;
}
