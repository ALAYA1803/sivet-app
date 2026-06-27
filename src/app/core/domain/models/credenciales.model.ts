/**
 * Credenciales temporales devueltas por el backend al dar de alta una cuenta
 * (clínica u empleado). Se entregan manualmente; el sistema obliga a cambiar la
 * contraseña en el primer inicio de sesión.
 */
export interface Credenciales {
  username: string;
  passwordTemporal: string;
}
