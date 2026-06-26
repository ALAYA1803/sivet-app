/**
 * Datos de prueba (mock) de SIVET — Veterinaria, San Borja, Lima.
 * Transcripción tipada de `_referencias_diseño/data.js`.
 *
 * NOTA: esta es la capa de infraestructura. Cuando exista el backend real,
 * estos arreglos se reemplazan por respuestas HTTP; los servicios de la capa
 * de aplicación no deberían cambiar su API pública.
 */
import {
  Atencion,
  CitaHoy,
  Cliente,
  FlujoPaciente,
  Mascota,
  Producto,
  Receta,
  ResumenMetodoPago,
  Venta,
} from '../../domain/models';

export const CLIENTES_MOCK: Cliente[] = [
  { id: 'c1', nombre: 'María Fernández Quispe', dni: '45782341', telefono: '987 654 321', email: 'maria.fq@gmail.com', direccion: 'Av. Aviación 2134, San Borja' },
  { id: 'c2', nombre: 'Carlos Ramírez Torres', dni: '08923471', telefono: '998 123 456', email: 'cramirez@hotmail.com', direccion: 'Calle Las Begonias 480, San Isidro' },
  { id: 'c3', nombre: 'Ana Lucía Vargas', dni: '72394851', telefono: '954 871 230', email: 'analu.vargas@gmail.com', direccion: 'Jr. Cuzco 1290, Lince' },
  { id: 'c4', nombre: 'Jorge Mendoza Salas', dni: '10238574', telefono: '976 234 109', email: 'jmendoza@outlook.com', direccion: 'Av. Primavera 850, Surco' },
  { id: 'c5', nombre: 'Patricia Huamán', dni: '46123987', telefono: '987 321 654', email: 'phuaman@gmail.com', direccion: 'Av. Brasil 3470, Magdalena' },
  { id: 'c6', nombre: 'Luis Alberto Chávez', dni: '09872134', telefono: '945 612 873', email: 'lachavez@gmail.com', direccion: 'Calle Los Olivos 234, La Molina' },
  { id: 'c7', nombre: 'Rosa Elena Pacheco', dni: '41872934', telefono: '912 873 645', email: 'rpacheco@gmail.com', direccion: 'Av. Javier Prado 1820, San Borja' },
  { id: 'c8', nombre: 'Diego Sánchez Ríos', dni: '70912834', telefono: '987 102 938', email: 'dsanchez@gmail.com', direccion: 'Jr. Independencia 540, Miraflores' },
];

export const MASCOTAS_MOCK: Mascota[] = [
  { id: 'm1', nombre: 'Luna', especie: 'Canino', raza: 'Mestizo', sexo: 'H', edad: '3 años', peso: 12.4, color: 'Marrón', clienteId: 'c1', foto: null, esterilizada: true, microchip: '982000123456789' },
  { id: 'm2', nombre: 'Toby', especie: 'Canino', raza: 'Shih Tzu', sexo: 'M', edad: '5 años', peso: 7.8, color: 'Blanco y negro', clienteId: 'c1', foto: null, esterilizada: false },
  { id: 'm3', nombre: 'Mishi', especie: 'Felino', raza: 'Doméstico pelo corto', sexo: 'H', edad: '2 años', peso: 4.1, color: 'Atigrado', clienteId: 'c2', foto: null, esterilizada: true },
  { id: 'm4', nombre: 'Max', especie: 'Canino', raza: 'Labrador Retriever', sexo: 'M', edad: '7 años', peso: 28.5, color: 'Dorado', clienteId: 'c3', foto: null, esterilizada: true, microchip: '982000987654321' },
  { id: 'm5', nombre: 'Coco', especie: 'Canino', raza: 'Yorkshire Terrier', sexo: 'M', edad: '4 años', peso: 3.2, color: 'Marrón y gris', clienteId: 'c4', foto: null, esterilizada: false },
  { id: 'm6', nombre: 'Nala', especie: 'Felino', raza: 'Siamés', sexo: 'H', edad: '1 año', peso: 3.5, color: 'Crema y marrón', clienteId: 'c5', foto: null, esterilizada: false },
  { id: 'm7', nombre: 'Rocco', especie: 'Canino', raza: 'Pastor Alemán', sexo: 'M', edad: '6 años', peso: 34.0, color: 'Negro y marrón', clienteId: 'c6', foto: null, esterilizada: true },
  { id: 'm8', nombre: 'Pelusa', especie: 'Felino', raza: 'Persa', sexo: 'H', edad: '8 años', peso: 5.2, color: 'Blanco', clienteId: 'c7', foto: null, esterilizada: true },
  { id: 'm9', nombre: 'Bruno', especie: 'Canino', raza: 'French Bulldog', sexo: 'M', edad: '2 años', peso: 11.0, color: 'Atigrado', clienteId: 'c8', foto: null, esterilizada: false },
  { id: 'm10', nombre: 'Kira', especie: 'Canino', raza: 'Husky Siberiano', sexo: 'H', edad: '4 años', peso: 22.0, color: 'Gris y blanco', clienteId: 'c3', foto: null, esterilizada: true },
];

export const ATENCIONES_MOCK: Atencion[] = [
  { id: 'a1', mascotaId: 'm1', fecha: '2026-05-24T10:30:00', tipo: 'Consulta general', motivo: 'Vómitos y decaimiento', diagnostico: 'Gastritis aguda leve. Probable indiscreción alimentaria.', tratamiento: 'Dieta blanda 48h, Omeprazol 1mg/kg cada 24h por 5 días, Metoclopramida si persisten vómitos.', veterinario: 'Dra. Carla Espinoza', temperatura: 39.1, frecCardiaca: 110, frecRespiratoria: 28, recetaId: 'r1' },
  { id: 'a2', mascotaId: 'm1', fecha: '2026-03-15T16:00:00', tipo: 'Vacunación', motivo: 'Refuerzo anual', diagnostico: 'Paciente clínicamente sano.', tratamiento: 'Vacuna óctuple canina aplicada. Próximo refuerzo: marzo 2027.', veterinario: 'Dr. Andrés Cáceres', temperatura: 38.8, frecCardiaca: 100, frecRespiratoria: 24 },
  { id: 'a3', mascotaId: 'm1', fecha: '2025-11-08T11:15:00', tipo: 'Desparasitación', motivo: 'Control trimestral', diagnostico: 'Sin hallazgos patológicos.', tratamiento: 'Drontal Plus 1 tableta. Próxima dosis: febrero 2026.', veterinario: 'Dra. Carla Espinoza', temperatura: 38.6, frecCardiaca: 102, frecRespiratoria: 22 },
  { id: 'a4', mascotaId: 'm1', fecha: '2025-08-22T09:00:00', tipo: 'Cirugía', motivo: 'Ovariohisterectomía', diagnostico: 'Procedimiento sin complicaciones.', tratamiento: 'Antibiótico (Cefalexina 22mg/kg cada 12h x 7d), antiinflamatorio (Meloxicam 0.1mg/kg cada 24h x 4d). Retiro de puntos en 10 días.', veterinario: 'Dr. Andrés Cáceres', temperatura: 38.5, frecCardiaca: 105, frecRespiratoria: 25 },
  { id: 'a5', mascotaId: 'm1', fecha: '2025-03-10T14:30:00', tipo: 'Vacunación', motivo: 'Refuerzo anual', diagnostico: 'Paciente sano.', tratamiento: 'Vacuna óctuple + antirrábica.', veterinario: 'Dra. Carla Espinoza', temperatura: 38.7, frecCardiaca: 100, frecRespiratoria: 22 },
  { id: 'a6', mascotaId: 'm4', fecha: '2026-05-26T08:30:00', tipo: 'Consulta general', motivo: 'Cojera pata posterior derecha', diagnostico: 'Sospecha de displasia de cadera.', tratamiento: 'Radiografía solicitada. Reposo y Carprofeno 2mg/kg cada 12h x 5 días.', veterinario: 'Dr. Andrés Cáceres', temperatura: 38.9, frecCardiaca: 95, frecRespiratoria: 20 },
  { id: 'a7', mascotaId: 'm3', fecha: '2026-05-25T17:00:00', tipo: 'Vacunación', motivo: 'Triple felina', diagnostico: 'Paciente sano.', tratamiento: 'Vacuna triple felina aplicada.', veterinario: 'Dra. Carla Espinoza', temperatura: 38.5, frecCardiaca: 160, frecRespiratoria: 30 },
];

export const RECETAS_MOCK: Receta[] = [
  {
    id: 'r1',
    atencionId: 'a1',
    items: [
      { medicamento: 'Omeprazol 10mg', dosis: '1 cápsula cada 24 horas', via: 'Vía oral', duracion: '5 días', indicaciones: 'Administrar en ayunas, 30 min antes del desayuno.' },
      { medicamento: 'Metoclopramida 10mg', dosis: '½ tableta cada 12 horas', via: 'Vía oral', duracion: '3 días', indicaciones: 'Solo si presenta vómitos.' },
    ],
  },
];

export const PRODUCTOS_MOCK: Producto[] = [
  { id: 'p1', codigo: 'MED-001', nombre: 'Drontal Plus', categoria: 'Medicamento', precio: 32.0, stock: 4, stockMin: 10, unidad: 'tableta' },
  { id: 'p2', codigo: 'MED-002', nombre: 'Bravecto 250mg', categoria: 'Antiparasitario', precio: 145.0, stock: 18, stockMin: 8, unidad: 'tableta' },
  { id: 'p3', codigo: 'MED-003', nombre: 'Meloxicam 1.5mg/ml suspensión', categoria: 'Antiinflamatorio', precio: 68.5, stock: 2, stockMin: 6, unidad: 'frasco 10ml' },
  { id: 'p4', codigo: 'VAC-001', nombre: 'Vacuna óctuple canina', categoria: 'Vacuna', precio: 55.0, stock: 24, stockMin: 12, unidad: 'dosis' },
  { id: 'p5', codigo: 'VAC-002', nombre: 'Vacuna antirrábica', categoria: 'Vacuna', precio: 35.0, stock: 32, stockMin: 12, unidad: 'dosis' },
  { id: 'p6', codigo: 'VAC-003', nombre: 'Triple felina', categoria: 'Vacuna', precio: 60.0, stock: 7, stockMin: 10, unidad: 'dosis' },
  { id: 'p7', codigo: 'ALI-001', nombre: 'Royal Canin Adult 15kg', categoria: 'Alimento', precio: 285.0, stock: 11, stockMin: 6, unidad: 'saco' },
  { id: 'p8', codigo: 'ALI-002', nombre: "Hill's Science Diet Puppy 7kg", categoria: 'Alimento', precio: 198.0, stock: 8, stockMin: 4, unidad: 'saco' },
  { id: 'p9', codigo: 'ALI-003', nombre: 'Pro Plan Felino Adult 7.5kg', categoria: 'Alimento', precio: 165.0, stock: 1, stockMin: 4, unidad: 'saco' },
  { id: 'p10', codigo: 'ACC-001', nombre: 'Collar antipulgas Seresto', categoria: 'Accesorio', precio: 145.0, stock: 14, stockMin: 5, unidad: 'unidad' },
  { id: 'p11', codigo: 'ACC-002', nombre: 'Arena sanitaria 10kg', categoria: 'Accesorio', precio: 28.0, stock: 22, stockMin: 8, unidad: 'bolsa' },
  { id: 'p12', codigo: 'SRV-001', nombre: 'Consulta general', categoria: 'Servicio', precio: 60.0, stock: null, stockMin: null, unidad: 'sesión' },
  { id: 'p13', codigo: 'SRV-002', nombre: 'Baño medicado', categoria: 'Servicio', precio: 55.0, stock: null, stockMin: null, unidad: 'sesión' },
  { id: 'p14', codigo: 'SRV-003', nombre: 'Corte de uñas', categoria: 'Servicio', precio: 15.0, stock: null, stockMin: null, unidad: 'sesión' },
  { id: 'p15', codigo: 'SRV-004', nombre: 'Hospitalización por día', categoria: 'Servicio', precio: 120.0, stock: null, stockMin: null, unidad: 'día' },
  { id: 'p16', codigo: 'MED-004', nombre: 'Cefalexina 500mg', categoria: 'Medicamento', precio: 1.8, stock: 145, stockMin: 50, unidad: 'tableta' },
  { id: 'p17', codigo: 'MED-005', nombre: 'Carprofeno 50mg', categoria: 'Antiinflamatorio', precio: 4.2, stock: 3, stockMin: 20, unidad: 'tableta' },
];

export const VENTAS_MOCK: Venta[] = [
  { id: 'v1', fecha: '2026-05-26T08:42:00', clienteId: 'c1', items: [{ productoId: 'p12', nombre: 'Consulta general', cantidad: 1, precio: 60.0 }, { productoId: 'p1', nombre: 'Drontal Plus', cantidad: 2, precio: 32.0 }], total: 124.0, metodoPago: 'Efectivo', estado: 'completada', vendedor: 'Lucía Paredes' },
  { id: 'v2', fecha: '2026-05-26T09:15:00', clienteId: 'c3', items: [{ productoId: 'p7', nombre: 'Royal Canin Adult 15kg', cantidad: 1, precio: 285.0 }, { productoId: 'p10', nombre: 'Collar antipulgas Seresto', cantidad: 1, precio: 145.0 }], total: 430.0, metodoPago: 'Tarjeta', estado: 'completada', vendedor: 'Lucía Paredes' },
  { id: 'v3', fecha: '2026-05-26T10:03:00', clienteId: 'c2', items: [{ productoId: 'p6', nombre: 'Triple felina', cantidad: 1, precio: 60.0 }, { productoId: 'p12', nombre: 'Consulta general', cantidad: 1, precio: 60.0 }], total: 120.0, metodoPago: 'Yape', estado: 'completada', vendedor: 'Marco Aliaga' },
  { id: 'v4', fecha: '2026-05-26T10:48:00', clienteId: 'c5', items: [{ productoId: 'p4', nombre: 'Vacuna óctuple canina', cantidad: 1, precio: 55.0 }, { productoId: 'p5', nombre: 'Vacuna antirrábica', cantidad: 1, precio: 35.0 }, { productoId: 'p12', nombre: 'Consulta general', cantidad: 1, precio: 60.0 }], total: 150.0, metodoPago: 'Plin', estado: 'completada', vendedor: 'Lucía Paredes' },
  { id: 'v5', fecha: '2026-05-26T11:22:00', clienteId: 'c4', items: [{ productoId: 'p2', nombre: 'Bravecto 250mg', cantidad: 1, precio: 145.0 }], total: 145.0, metodoPago: 'Tarjeta', estado: 'completada', vendedor: 'Marco Aliaga' },
  { id: 'v6', fecha: '2026-05-26T12:01:00', clienteId: 'c6', items: [{ productoId: 'p13', nombre: 'Baño medicado', cantidad: 1, precio: 55.0 }, { productoId: 'p14', nombre: 'Corte de uñas', cantidad: 1, precio: 15.0 }], total: 70.0, metodoPago: 'Efectivo', estado: 'completada', vendedor: 'Lucía Paredes' },
  { id: 'v7', fecha: '2026-05-26T12:34:00', clienteId: 'c7', items: [{ productoId: 'p11', nombre: 'Arena sanitaria 10kg', cantidad: 2, precio: 28.0 }], total: 56.0, metodoPago: 'Efectivo', estado: 'completada', vendedor: 'Marco Aliaga' },
  { id: 'v8', fecha: '2026-05-25T17:30:00', clienteId: 'c2', items: [{ productoId: 'p9', nombre: 'Pro Plan Felino Adult 7.5kg', cantidad: 1, precio: 165.0 }, { productoId: 'p6', nombre: 'Triple felina', cantidad: 1, precio: 60.0 }], total: 225.0, metodoPago: 'Tarjeta', estado: 'completada', vendedor: 'Lucía Paredes' },
  { id: 'v9', fecha: '2026-05-25T11:00:00', clienteId: 'c8', items: [{ productoId: 'p8', nombre: "Hill's Science Diet Puppy 7kg", cantidad: 1, precio: 198.0 }], total: 198.0, metodoPago: 'Yape', estado: 'anulada', vendedor: 'Marco Aliaga', motivoAnulacion: 'Cliente cambió de opinión, se devolvió el producto.' },
];

export const FLUJO_PACIENTES_MOCK: FlujoPaciente[] = [
  { dia: 'Mié 20', total: 14 },
  { dia: 'Jue 21', total: 18 },
  { dia: 'Vie 22', total: 22 },
  { dia: 'Sáb 23', total: 28 },
  { dia: 'Dom 24', total: 9 },
  { dia: 'Lun 25', total: 16 },
  { dia: 'Mar 26', total: 11 },
];

export const METODOS_PAGO_RESUMEN_MOCK: ResumenMetodoPago[] = [
  { metodo: 'Tarjeta', monto: 1485.5, color: '#2563EB', porcentaje: 42 },
  { metodo: 'Efectivo', monto: 820.0, color: '#10B981', porcentaje: 23 },
  { metodo: 'Yape', monto: 740.0, color: '#7C3AED', porcentaje: 21 },
  { metodo: 'Plin', monto: 495.0, color: '#0EA5E9', porcentaje: 14 },
];

export const CITAS_HOY_MOCK: CitaHoy[] = [
  { hora: '14:00', mascota: 'Rocco', cliente: 'Luis Chávez', tipo: 'Control post-operatorio', vet: 'Dr. Cáceres' },
  { hora: '15:30', mascota: 'Nala', cliente: 'Patricia Huamán', tipo: 'Esterilización', vet: 'Dra. Espinoza' },
  { hora: '16:15', mascota: 'Bruno', cliente: 'Diego Sánchez', tipo: 'Consulta general', vet: 'Dr. Cáceres' },
  { hora: '17:00', mascota: 'Kira', cliente: 'Ana Vargas', tipo: 'Vacunación', vet: 'Dra. Espinoza' },
];
