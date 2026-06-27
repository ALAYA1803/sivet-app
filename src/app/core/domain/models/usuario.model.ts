/**
 * Usuario del sistema (cuenta de acceso). No hay registro público: las cuentas
 * las crea el administrador. Cada usuario pertenece a UNA clínica (tenant).
 * Persistido en la colección `usuarios` del backend.
 */
export interface Usuario {
  id: string;
  username: string;
  /** Solo de entrada (alta de usuario). Se guarda hasheado (BCrypt); el backend nunca lo expone. */
  password: string;
  nombre: string;
  rol: string;
  /** Clínica a la que pertenece (Tenant ID). */
  clinica_id: string;
}
