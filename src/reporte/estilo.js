// Estilo del reporte: sobrio, de documento técnico (tablas tipo booktabs, secciones numeradas),
// con la paleta del Calcite Design System en modo claro. Medidas en puntos (1 mm ≈ 2,835 pt).
export const color = {
  texto: '#151515', // --calcite-color-text-1
  texto2: '#4a4a4a', // --calcite-color-text-2
  texto3: '#6a6a6a', // --calcite-color-text-3
  marca: '#007ac2', // --calcite-color-brand
  regla: '#151515',
  reglaFina: '#bfbfbf' // --calcite-color-border-1
};

export const pagina = {
  pageSize: 'A4',
  pageMargins: [72, 74, 72, 64], // izquierda, arriba, derecha, abajo
  defaultStyle: { font: 'Helvetica', fontSize: 10, lineHeight: 1.3, color: color.texto }
};

export const estilos = {
  rotulo: { fontSize: 8, bold: true, color: color.marca, characterSpacing: 0.8 },
  h1: { fontSize: 20, bold: true, lineHeight: 1.15, margin: [0, 4, 0, 8] },
  h2: { fontSize: 12.5, bold: true, margin: [0, 20, 0, 8] },
  h3: { fontSize: 10.5, bold: true, margin: [0, 12, 0, 4] },
  p: { margin: [0, 0, 0, 7] },
  meta: { fontSize: 9, color: color.texto2, lineHeight: 1.4, margin: [0, 0, 0, 2] },
  nota: { fontSize: 8.5, italics: true, color: color.texto3, margin: [0, 2, 0, 6] },
  th: { bold: true, fontSize: 9, color: color.texto },
  td: { fontSize: 9.5 },
  enlace: { color: color.marca },
  pie: { fontSize: 7.5, color: color.texto3 }
};

/** Reglas de tabla estilo booktabs: gruesa arriba y abajo, fina bajo el encabezado y antes del total. */
export const tabla = (filas, conTotal) => ({
  hLineWidth: (i) => (i === 0 || i === filas ? 1 : i === 1 || (conTotal && i === filas - 1) ? 0.5 : 0),
  vLineWidth: () => 0,
  hLineColor: () => color.regla,
  paddingLeft: (i) => (i === 0 ? 0 : 8),
  paddingRight: (i, n) => (i === n.table.widths.length - 1 ? 0 : 8),
  paddingTop: () => 3.5,
  paddingBottom: () => 3.5
});
