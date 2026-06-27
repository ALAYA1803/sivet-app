/**
 * Perfil de una clínica/veterinaria (el arrendatario del SaaS). Persistido en
 * la colección `clinicas` del backend; el login lo carga por `clinica_id`.
 */
export interface Clinica {
  id: string;
  nombre: string;
  /** Sede o sucursal. */
  sede: string;
  ruc: string;
  telefono: string;
  email: string;
  direccion: string;
}
