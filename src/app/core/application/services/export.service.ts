import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastService } from './toast.service';
import { environment } from '../../../../environments/environment';

/** Rango temporal admitido por el reporte de ventas. */
export type RangoReporte = 'hoy' | 'semana' | 'mes';

/**
 * Filtros opcionales del reporte de ventas (`GET /reportes/ventas.xlsx`).
 * - Reportes consolidados usan `rango`.
 * - El listado/grilla de Ventas usa `estado` + `q` (búsqueda).
 * Todos son opcionales; sin filtros se exporta la grilla completa.
 */
export interface FiltroReporteVentas {
  rango?: RangoReporte;
  estado?: string;
  q?: string;
}

/**
 * Capa de salida de datos a documentos descargables.
 *
 * Descarga binarios **reales** generados por el backend (Spring Boot) usando
 * `responseType: 'blob'`. El `tenantInterceptor` ya inyecta `Authorization`
 * y `X-Tenant-ID` en cada petición, de modo que cada documento queda acotado
 * al tenant autenticado.
 *
 * Patrón de descarga (uniforme para PDF y Excel):
 *   1. `GET` del endpoint con `responseType: 'blob'`.
 *   2. `URL.createObjectURL(blob)` para obtener una URL temporal del binario.
 *   3. Se crea un `<a download>` invisible, se hace clic programático.
 *   4. Se limpia el nodo y se revoca la object URL (evita fugas de memoria).
 */
@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly apiUrl = environment.apiUrl;

  // --- PDF ---------------------------------------------------------------

  /** Comprobante/ticket de una venta → `GET /ventas/{id}/comprobante.pdf`. */
  descargarComprobanteVenta(ventaId: string): void {
    this.descargar(
      `${this.apiUrl}/ventas/${ventaId}/comprobante.pdf`,
      `ticket-${ventaId}.pdf`,
    );
  }

  /** Receta médica → `GET /recetas/{id}/pdf`. */
  descargarRecetaPdf(recetaId: string): void {
    this.descargar(`${this.apiUrl}/recetas/${recetaId}/pdf`, `receta-${recetaId}.pdf`);
  }

  // --- Excel -------------------------------------------------------------

  /**
   * Reporte de ventas en Excel → `GET /reportes/ventas.xlsx`.
   * Acepta tanto el `rango` temporal (vista Reportes) como los filtros
   * `estado` + `q` de la grilla de Ventas. El backend exporta los listados
   * masivos **solo** en `.xlsx` (el PDF queda para documentos individuales).
   */
  descargarReporteVentas(filtros: FiltroReporteVentas = {}): void {
    const params = new URLSearchParams();
    if (filtros.rango) params.set('rango', filtros.rango);
    if (filtros.estado && filtros.estado !== 'todas') params.set('estado', filtros.estado);
    if (filtros.q?.trim()) params.set('q', filtros.q.trim());

    const query = params.toString() ? `?${params.toString()}` : '';
    const sufijo = filtros.rango ?? filtros.estado ?? 'todas';
    this.descargar(`${this.apiUrl}/reportes/ventas.xlsx${query}`, `reporte-ventas-${sufijo}.xlsx`);
  }

  /** Inventario completo → `GET /reportes/catalogo.xlsx`. */
  descargarReporteCatalogo(): void {
    this.descargar(`${this.apiUrl}/reportes/catalogo.xlsx`, 'catalogo-inventario.xlsx');
  }

  /** Listado de pacientes → `GET /reportes/pacientes.xlsx` (filtro opcional `q`). */
  descargarReportePacientes(q = ''): void {
    const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    this.descargar(`${this.apiUrl}/reportes/pacientes.xlsx${query}`, 'pacientes.xlsx');
  }

  // --- Núcleo de descarga ------------------------------------------------

  /**
   * Pide el binario al backend y fuerza su descarga en el navegador.
   * Cualquier error (red, 401/403, 404…) se traduce en un toast.
   */
  private descargar(url: string, filename: string): void {
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => this.guardarBlob(blob, filename),
      error: () => this.toast.error('No se pudo generar el documento.'),
    });
  }

  /** Materializa un `Blob` como archivo descargado vía `<a download>` efímero. */
  private guardarBlob(blob: Blob, filename: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }
}
