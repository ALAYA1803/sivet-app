/**
 * Usuario del sistema (cuenta de acceso). No hay registro público: las cuentas
 * las crea el administrador. Cada usuario pertenece a UNA clínica (tenant).
 * Persistido en la colección `usuarios` del backend.
 */
export interface Usuario {
  id: string;
  username: string;
  /** Sólo para el login simulado contra json-server; el backend real nunca lo expone. */
  password: string;
  nombre: string;
  rol: string;
  /** Clínica a la que pertenece (Tenant ID). */
  clinica_id: string;
}
