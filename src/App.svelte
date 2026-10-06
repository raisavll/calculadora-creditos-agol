<script>
  import { S, F } from './services.js';

  const groups = [...new Set(S.map((s) => s.g))];
  // Estado de cada servicio: casilla y valor de cada campo (nada se guarda fuera de la página)
  const fresh = () =>
    S.map((s) => ({
      on: false,
      f: s.f.map(([id, , d = 0, o, u]) => ({ id, base: u, unit: u, val: u ? '' : o ? String(d) : d ? String(d) : '' }))
    }));

  let st = $state(fresh());
  // PRESUPUESTO (desactivado). Para reactivarlo: descomente estas líneas, `disp`, las dos líneas de reset()
  // y el bloque "Presupuesto (opcional)" del HTML.
  // let saldo = $state('');
  // let precio = $state('');
  let copied = $state('Copiar resumen');

  const nf = (x, d = 2) => x.toLocaleString('es', { maximumFractionDigits: d });

  const rows = $derived(
    S.flatMap((s, i) => {
      if (!st[i].on) return [];
      const v = {};
      for (const f of st[i].f) {
        let x = parseFloat(f.val) || 0;
        if (f.base) x *= F[f.unit] / F[f.base]; // KB/MB/GB -> unidad de la tarifa
        v[f.id] = x;
      }
      return [{ i, name: s.t.split(' (')[0], c: s.c(v) || 0 }];
    })
  );
  const total = $derived(rows.reduce((a, r) => a + r.c, 0));
  const sub = (i) => rows.find((r) => r.i === i)?.c ?? 0;
  // const disp = $derived(parseFloat(saldo));

  async function copy() {
    const t = `Estimación de créditos de ArcGIS Online\n${rows.map((r) => `- ${r.name}: ${nf(r.c)}`).join('\n')}\nTOTAL: ${nf(total)} créditos`;
    try { await navigator.clipboard.writeText(t); copied = 'Copiado'; } catch { copied = 'No se pudo copiar'; }
    setTimeout(() => (copied = 'Copiar resumen'), 1500);
  }
  function reset() {
    st = fresh();
    // saldo = '';
    // precio = '';
  }
</script>

<calcite-shell>
  <calcite-navigation slot="header">
    <calcite-navigation-logo slot="logo" heading="Calculadora de créditos" description="ArcGIS Online"></calcite-navigation-logo>
  </calcite-navigation>

  <div class="wrap"><div class="cols">
    <div>
      <p class="intro">Marque los servicios que va a usar e ingrese las cantidades. El total se actualiza al instante y nada se guarda ni se envía.</p>

      {#each groups as g}
        <calcite-block heading={g} expanded collapsible>
          {#each S as s, i}
            {#if s.g === g}
              <div class="svc">
                <div class="svc-head">
                  <calcite-label layout="inline">
                    <calcite-checkbox checked={st[i].on} oncalciteCheckboxChange={(e) => (st[i].on = e.target.checked)}></calcite-checkbox>{s.t}
                  </calcite-label>
                  {#if st[i].on}<calcite-chip scale="s">{nf(sub(i), 3)}</calcite-chip>{/if}
                </div>
                <p class="rate">{s.r}</p>

                {#if st[i].on}
                  <div class="fields">
                    {#each s.f as fd, k}
                      <calcite-label>{fd[1]}
                        {#if st[i].f[k].base}
                          <div class="sz">
                            <calcite-input-number min="0" step="any" number-button-type="none" value={st[i].f[k].val}
                              oncalciteInputNumberInput={(e) => (st[i].f[k].val = e.target.value)}></calcite-input-number>
                            <calcite-select label="Unidad" value={st[i].f[k].unit}
                              oncalciteSelectChange={(e) => (st[i].f[k].unit = e.target.value)}>
                              {#each ['KB', 'MB', 'GB'] as u}<calcite-option value={u} selected={u === st[i].f[k].unit}>{u}</calcite-option>{/each}
                            </calcite-select>
                          </div>
                        {:else if fd[3]}
                          <calcite-select label={fd[1]} value={st[i].f[k].val}
                            oncalciteSelectChange={(e) => (st[i].f[k].val = e.target.value)}>
                            {#each fd[3] as [val, txt]}<calcite-option value={String(val)} selected={String(val) === st[i].f[k].val}>{txt}</calcite-option>{/each}
                          </calcite-select>
                        {:else}
                          <calcite-input-number min="0" step="any" number-button-type="none" value={st[i].f[k].val}
                            oncalciteInputNumberInput={(e) => (st[i].f[k].val = e.target.value)}></calcite-input-number>
                        {/if}
                      </calcite-label>
                    {/each}
                    {#if s.n}<calcite-notice open icon kind="warning" scale="s"><div slot="message">{s.n}</div></calcite-notice>{/if}
                  </div>
                {/if}
              </div>
            {/if}
          {/each}
        </calcite-block>
      {/each}

      <p class="foot">Esta es una estimación calculada de acuerdo con la <calcite-link href="https://doc.arcgis.com/es/arcgis-online/administer/credits.htm" target="_blank">tabla oficial de créditos por servicio</calcite-link> de ArcGIS Online. El consumo real puede variar; verifique las tarifas vigentes antes de presupuestar. Los tamaños se convierten con 1 GB = 1.024 MB y 1 MB = 1.024 KB.</p>
    </div>

    <div class="sum" aria-live="polite">
      <calcite-block heading="Total estimado" expanded>
        <div class="total">{nf(total)}</div>
        <div class="mu">créditos</div>
        <calcite-list label="Desglose por servicio">
          {#each rows as r (r.i)}<calcite-list-item label={r.name} description="{nf(r.c)} créditos"></calcite-list-item>{/each}
        </calcite-list>
      </calcite-block>

      <!-- PRESUPUESTO (desactivado): descomente este bloque para mostrar créditos disponibles y precio por crédito.
      <calcite-block heading="Presupuesto (opcional)" expanded>
        <calcite-label>Créditos disponibles
          <calcite-input-number min="0" step="any" number-button-type="none" value={saldo}
            oncalciteInputNumberInput={(e) => (saldo = e.target.value)}></calcite-input-number>
        </calcite-label>
        <calcite-label>Precio por crédito
          <calcite-input-number min="0" step="any" number-button-type="none" value={precio}
            oncalciteInputNumberInput={(e) => (precio = e.target.value)}></calcite-input-number>
        </calcite-label>
        {#if precio !== '' && !isNaN(parseFloat(precio))}<div>Costo estimado: {nf(total * parseFloat(precio))}</div>{/if}
        {#if saldo !== '' && !isNaN(disp)}
          {#if total <= disp}
            <calcite-notice open kind="success" icon scale="s"><div slot="message">El saldo alcanza. Quedarían {nf(disp - total)} créditos.</div></calcite-notice>
          {:else}
            <calcite-notice open kind="warning" icon scale="s"><div slot="message">El saldo no alcanza: faltan {nf(total - disp)} créditos.</div></calcite-notice>
          {/if}
        {/if}
      </calcite-block>
      -->

      <div class="btns">
        <calcite-button icon-start="copy" onclick={copy}>{copied}</calcite-button>
        <calcite-button appearance="outline" onclick={reset}>Limpiar</calcite-button>
      </div>
    </div>
  </div></div>
</calcite-shell>

<style>
  :global(html), :global(body) { height: 100%; margin: 0; }
  .wrap { height: 100%; overflow: auto; }
  .cols { max-width: 1100px; margin: 0 auto; padding: 16px; display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }
  .sum { position: sticky; top: 16px; display: grid; gap: 12px; }
  @media (max-width: 860px) { .cols { grid-template-columns: 1fr; } .sum { position: static; } }
  .intro { color: var(--calcite-color-text-2); margin: 0 0 12px; max-width: 65ch; }
  .svc { padding: 10px 14px; border-top: 1px solid var(--calcite-color-border-3); }
  .svc-head { display: flex; align-items: center; gap: 8px; }
  .svc-head calcite-label { flex: 1; }
  .rate { font-size: var(--calcite-font-size--2); color: var(--calcite-color-text-3); margin: 0 0 0 28px; }
  .fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px 12px; margin: 8px 0 0 28px; }
  .fields calcite-notice { grid-column: 1 / -1; }
  .sz { display: flex; gap: 8px; }
  .sz calcite-input-number { flex: 1; }
  .sz calcite-select { width: 92px; }
  .total { font-size: 2.75rem; font-weight: 700; line-height: 1; color: var(--calcite-color-brand); font-variant-numeric: tabular-nums; }
  .mu { color: var(--calcite-color-text-3); margin-bottom: 8px; }
  .btns { display: flex; gap: 8px; }
  .btns calcite-button { flex: 1; }
  .foot { font-size: var(--calcite-font-size--2); color: var(--calcite-color-text-3); max-width: 65ch; }
</style>
