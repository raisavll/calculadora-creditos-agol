// Genera el reporte PDF a partir de la plantilla Markdown (plantilla.md) con el estilo de estilo.js.
// El Markdown se convierte a un documento de pdfmake: texto vectorial y seleccionable, no una captura.
// Las librerías se cargan solo al pulsar el botón, para no hacer más pesada la página.
import plantilla from './plantilla.md?raw';
import { color, pagina, estilos, tabla } from './estilo.js';

const TITULO_PIE = 'Calculadora de créditos de ArcGIS Online';
const CREDITO = 'Elaborado por: @raisavll';

/** Escapa los caracteres que Markdown interpretaría dentro de un valor. */
const md = (s) => String(s).replace(/([\\|*_[\]`])/g, '\\$1');

/** Sustituye {{clave}} en la plantilla. */
const llenar = (texto, datos) => texto.replace(/\{\{(\w+)\}\}/g, (_, k) => datos[k] ?? '');

// ---------- Markdown (tokens de marked) -> pdfmake ----------

function enLinea(tokens = [], base = {}) {
  return tokens.flatMap((t) => {
    switch (t.type) {
      case 'strong': return enLinea(t.tokens, { ...base, bold: true });
      case 'em': return enLinea(t.tokens, { ...base, italics: true });
      case 'link': return enLinea(t.tokens, { ...base, ...estilos.enlace, link: t.href });
      case 'codespan': return [{ ...base, text: t.text, font: 'Courier' }];
      case 'br': return [{ ...base, text: '\n' }];
      case 'text': return t.tokens ? enLinea(t.tokens, base) : [{ ...base, text: desescapar(t.text) }];
      case 'escape': return [{ ...base, text: t.text }];
      default: return [{ ...base, text: desescapar(t.raw ?? t.text ?? '') }];
    }
  });
}
const desescapar = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const plano = (tokens = []) => enLinea(tokens).map((x) => x.text).join('');

function convertir(tokens) {
  const raiz = [];
  let out = raiz; // dentro de una subsección (###) se agrupa todo para que no se parta entre páginas
  let n2 = 0, n3 = 0;
  let cabecera = false; // entre el título (#) y la primera sección (##) va el bloque de datos

  for (const t of tokens) {
    if (t.type === 'heading' && t.depth === 1) {
      out.push({ text: enLinea(t.tokens), style: 'h1' });
      cabecera = true;
    } else if (t.type === 'heading') {
      out = raiz;
      if (cabecera) { out.push(regla(0.5, [0, 10, 0, 0])); cabecera = false; }
      if (t.depth === 2) { n2++; n3 = 0; out.push({ text: `${n2}  ${plano(t.tokens)}`, style: 'h2' }); }
      else {
        n3++;
        const grupo = { stack: [{ text: `${n2}.${n3}  ${plano(t.tokens)}`, style: 'h3' }], unbreakable: true };
        raiz.push(grupo);
        out = grupo.stack;
      }
    } else if (t.type === 'paragraph') {
      out.push({ text: enLinea(t.tokens), style: cabecera ? 'meta' : 'p' });
    } else if (t.type === 'table') {
      const conTotal = /^total$/i.test(t.rows.at(-1)?.[0]?.text.replace(/\*/g, '').trim());
      const al = t.align.map((a) => a ?? 'left');
      const body = [
        t.header.map((c, j) => ({ text: enLinea(c.tokens), style: 'th', alignment: al[j] })),
        ...t.rows.map((r) => r.map((c, j) => ({ text: enLinea(c.tokens), style: 'td', alignment: al[j] })))
      ];
      out.push({
        table: { headerRows: 1, dontBreakRows: true, widths: t.header.map((_, j) => (j === 0 ? '*' : 'auto')), body },
        layout: tabla(body.length, conTotal),
        margin: [0, 4, 0, 10]
      });
    } else if (t.type === 'list') {
      const items = t.items.map((it) => ({ text: enLinea(it.tokens.flatMap((x) => x.tokens ?? [x])), margin: [0, 0, 0, 3] }));
      out.push(t.ordered ? { ol: items, margin: [0, 0, 0, 6] } : { ul: items, margin: [0, 0, 0, 6], markerColor: color.texto3 });
    } else if (t.type === 'blockquote') {
      out.push({ text: enLinea(t.tokens.flatMap((x) => x.tokens ?? [])), style: 'nota' });
    } else if (t.type === 'hr') {
      out.push(regla(0.5, [0, 8, 0, 8]));
    }
  }
  return raiz;
}

const ANCHO = 595.28 - pagina.pageMargins[0] - pagina.pageMargins[2];
const regla = (w, margin) => ({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: ANCHO, y2: 0, lineWidth: w, lineColor: color.regla }], margin });

// ---------- Generación ----------

/**
 * @param {Array<{name:string, grupo:string, tarifa:string, nota?:string, c:number, campos:Array<{etiqueta:string, valor:string}>}>} items
 * @param {number} total
 * @param {(x:number, d?:number) => string} nf  formateador de números
 */
export async function generarPDF(items, total, nf) {
  const [{ marked }, pdfMakeMod, helvetica] = await Promise.all([
    import('marked'),
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/standard-fonts/Helvetica')
  ]);
  const pdfMake = pdfMakeMod.default ?? pdfMakeMod;
  pdfMake.addFontContainer(helvetica.default ?? helvetica);

  const hoy = new Date();
  const fecha = hoy.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  const filas = items.map((r) => `| ${md(r.name)} | ${md(r.grupo)} | ${nf(r.c)} |`).join('\n');
  const detalle = items
    .map((r) =>
      [
        `### ${md(r.name)}`,
        '',
        `Tarifa: ${md(r.tarifa)}.`,
        '',
        '| Parámetro | Valor |\n|:---|---:|',
        ...r.campos.map((f) => `| ${md(f.etiqueta)} | ${md(f.valor)} |`),
        `| **Subtotal** | **${nf(r.c, 3)} créditos** |`,
        r.nota ? `\n> Nota: ${md(r.nota)}` : ''
      ].join('\n')
    )
    .join('\n\n');

  const texto = llenar(plantilla, { fecha, total: nf(total), servicios: items.length, filas, detalle });
  const content = convertir(marked.lexer(texto));

  const doc = {
    ...pagina,
    info: { title: 'Estimación de créditos de ArcGIS Online', author: '@raisavll', creator: TITULO_PIE },
    styles: estilos,
    content,
    header: (pag) =>
      pag === 1 ? null : {
        margin: [pagina.pageMargins[0], 36, pagina.pageMargins[2], 0],
        stack: [{ text: 'Estimación de créditos de ArcGIS Online', style: 'pie' }, regla(0.4, [0, 4, 0, 0])]
      },
    footer: (pag, total) => ({
      margin: [pagina.pageMargins[0], 20, pagina.pageMargins[2], 0],
      stack: [
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: ANCHO, y2: 0, lineWidth: 0.4, lineColor: color.reglaFina }] },
        { columns: [{ text: `${TITULO_PIE} · ${CREDITO}`, style: 'pie' }, { text: `${pag} / ${total}`, style: 'pie', alignment: 'right', width: 'auto' }], margin: [0, 5, 0, 0] }
      ]
    })
  };

  await pdfMake.createPdf(doc).download(`estimacion-creditos-${hoy.toISOString().slice(0, 10)}.pdf`);
}
