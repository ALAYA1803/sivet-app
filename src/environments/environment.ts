/**
 * Configuración de entorno por defecto (build de producción).
 * En desarrollo, Angular reemplaza este archivo por `environment.development.ts`
 * vía `fileReplacements` en angular.json.
 */
export const environment = {
  production: true,
  /** Base del backend REST (Spring Boot). */
  apiUrl: 'https://sivet-backend.onrender.com',
};
