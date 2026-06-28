import { Injectable, inject } from '@angular/core';
import { RecetaItem } from '../../domain/models';
import { ToastService } from './toast.service';

/** Datos necesarios para componer una receta imprimible. */
export interface RecetaImprimible {
  clinicaNombre: string;
  clinicaSede?: string;
  paciente: { nombre: string; especie: string; raza: string; edad: string; sexo: string };
  duenio: { nombre: string; dni: string };
  veterinario: string;
  /** Fecha-hora ISO de la atención. */
  fecha: string;
  items: RecetaItem[];
}

/**
 * Genera una receta médica lista para imprimir. Abre una ventana limpia del
 * navegador con el documento maquetado y dispara `window.print()`, evitando
 * depender de un PDF del backend (que no siempre está disponible).
 */
@Injectable({ providedIn: 'root' })
export class RecetaPrintService {
  private readonly toast = inject(ToastService);

  imprimir(data: RecetaImprimible): void {
    if (data.items.length === 0) {
      this.toast.error('Esta receta no tiene medicamentos para imprimir.');
      return;
    }

    const ventana = window.open('', '_blank', 'width=820,height=900');
    if (!ventana) {
      this.toast.error('Permite las ventanas emergentes para generar la receta.');
      return;
    }

    ventana.document.open();
    ventana.document.write(this.construirHtml(data));
    ventana.document.close();
    ventana.focus();
    // Espera al render para que la cabecera/medicamentos salgan en la impresión.
    ventana.onload = () => {
      ventana.print();
    };
  }

  private construirHtml(d: RecetaImprimible): string {
    const fecha = new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(d.fecha));

    const filas = d.items
      .map(
        (m) => `
        <tr>
          <td><strong>${this.escape(m.medicamento)}</strong></td>
          <td>${this.escape(m.dosis)}</td>
          <td>${this.escape(m.via)}</td>
          <td>${this.escape(m.duracion)}</td>
        </tr>
        ${
          m.indicaciones?.trim()
            ? `<tr class="ind"><td colspan="4"><em>Indicaciones:</em> ${this.escape(m.indicaciones)}</td></tr>`
            : ''
        }`,
      )
      .join('');

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Receta médica · ${this.escape(d.paciente.nombre)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 3px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 24px; }
    .clinica { font-size: 22px; font-weight: 700; color: #0369a1; }
    .sede { font-size: 12px; color: #64748b; margin-top: 2px; }
    .titulo { text-align: right; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
      color: #0ea5e9; font-weight: 700; }
    .fecha { text-align: right; font-size: 12px; color: #64748b; margin-top: 4px; }
    .datos { display: flex; gap: 40px; margin-bottom: 24px; font-size: 13px; }
    .datos .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; }
    .datos .val { font-weight: 600; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #0369a1;
      border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b;
      padding: 8px 6px; border-bottom: 1px solid #e2e8f0; }
    td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tr.ind td { color: #475569; font-size: 12px; border-bottom: 1px solid #e2e8f0; padding-top: 0; }
    .firma { margin-top: 80px; width: 240px; border-top: 1px solid #94a3b8; padding-top: 6px;
      font-size: 12px; }
    .firma .vet { font-weight: 600; }
    .firma .reg { color: #64748b; font-size: 11px; }
    @media print { body { padding: 24px; } @page { margin: 12mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinica">${this.escape(d.clinicaNombre)}</div>
      ${d.clinicaSede ? `<div class="sede">Sede ${this.escape(d.clinicaSede)}</div>` : ''}
    </div>
    <div>
      <div class="titulo">Receta médica veterinaria</div>
      <div class="fecha">${fecha}</div>
    </div>
  </div>

  <div class="datos">
    <div>
      <div class="label">Paciente</div>
      <div class="val">${this.escape(d.paciente.nombre)}</div>
      <div>${this.escape(d.paciente.especie)} · ${this.escape(d.paciente.raza)}</div>
      <div>${d.paciente.sexo === 'M' ? 'Macho' : 'Hembra'} · ${this.escape(d.paciente.edad)}</div>
    </div>
    <div>
      <div class="label">Propietario</div>
      <div class="val">${this.escape(d.duenio.nombre)}</div>
      <div>DNI ${this.escape(d.duenio.dni)}</div>
    </div>
  </div>

  <h2>Prescripción</h2>
  <table>
    <thead>
      <tr><th>Medicamento</th><th>Dosis</th><th>Vía</th><th>Duración</th></tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="firma">
    <div class="vet">${this.escape(d.veterinario)}</div>
    <div class="reg">Médico Veterinario · Firma y sello</div>
  </div>
</body>
</html>`;
  }

  /** Escapa texto para insertarlo de forma segura en el HTML generado. */
  private escape(value: string): string {
    return (value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
