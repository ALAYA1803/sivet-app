/**
 * Configuración de entorno para desarrollo (`ng serve`).
 * Apunta al backend REST local (Spring Boot) en el puerto 8080.
 */
export const environment = {
  production: false,
  /** Base del backend REST (Spring Boot). */
  apiUrl: 'http://localhost:8080',
};
