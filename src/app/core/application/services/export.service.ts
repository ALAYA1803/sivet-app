import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

/** Formatos de exportación soportados (la implementación real llegará con jspdf/xlsx). */
export type ExportFormat = 'excel' | 'pdf';

/**
 * Capa de salida de datos a documentos descargables.
 *
 * Por ahora simula la exportación: dispara un toast y vuelca los datos
 * estructurados por consola. La integración real de librerías
 * (`xlsx` para Excel, `jspdf` para PDF) se conectará aquí sin cambiar
 * la API pública que ya consumen las vistas.
 */
@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly toast = inject(ToastService);

  /** Exporta una colección a una hoja de cálculo (.xlsx). */
  exportToExcel<T>(data: readonly T[], filename: string): void {
    this.simular('excel', data, filename);
  }

  /** Exporta una colección o documento a PDF. */
  exportToPDF<T>(data: readonly T[], filename: string): void {
    this.simular('pdf', data, filename);
  }

  private simular<T>(formato: ExportFormat, data: readonly T[], filename: string): void {
    const extension = formato === 'excel' ? 'xlsx' : 'pdf';
    // eslint-disable-next-line no-console
    console.log(`[ExportService] Exportando "${filename}.${extension}"`, {
      formato,
      registros: data.length,
      data,
    });
    this.toast.success('Exportando documento...');
  }
}
