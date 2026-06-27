/**
 * Configuración de entorno para desarrollo (`ng serve`).
 * Apunta al json-server local que simula el backend REST.
 */
export const environment = {
  production: false,
  /** Base del backend (json-server: `npm run api`). */
  apiUrl: 'http://localhost:8080',
};
