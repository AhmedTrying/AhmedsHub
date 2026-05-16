/* global React, Icon, ESTIMATE_ITEMS_SEED, fmtAED, fmtNum, scopeTint, ToastContext, Modal, RATES */

const CATS = ["All", "Manpower", "Cleaning", "HVAC", "Electrical", "Plumbing", "Civil", "Pest Control", "Consumables", "Safety"];

const EstimateBuilder = () => {
  const { push } = React.useContext(ToastContext);
  const [rows, setRows] = React.useState(ESTIMATE_ITEMS_SEED);
  const [cat, setCat] = React.useState("All");
  const [addOpen, setAddOpen] = React.useState(false);
  const [pickRate, setPickRate] = React.useState(false);
  const [genOpen, setGenOpen] = React.useState(false);

  const visible = cat === "All" ? rows : rows.filter(r => r.category === cat);

  const update = (id, k, v) => setRows(rs => rs.map(r => r.id === id ? {...r, [k]: v} : r));
  const dupe = id => setRows(rs => {
    const i = rs.findIndex(r => r.id === id);
    const clone = { ...rs[i], id: "e" + Date.now(), item: rs[i].item + "·" };
    return [...rs.slice(0, i+1), clone, ...rs.slice(i+1)];
  });
  const del = id => setRows(rs => rs.filter(r => r.id !== id));
  const addRow = () => setRows(rs => [...rs, { id: "e" + Date.now(), item: "NEW-" + (rs.length+1), desc: "New line item", category: "Cleaning", unit: "month", qty: 1, cost: 0, markup: 20, notes: "" }]);

  const totals = React.useMemo(() => {
    const directCost = rows.reduce((s, r) => s + (r.qty || 0) * (r.cost || 0), 0);
    const sellingTotal = rows.reduce((s, r) => s + (r.qty || 0) * (r.cost || 0) * (1 + (r.markup || 0)/100), 0);
    const markupAmt = sellingTotal - directCost;
    return { directCost, sellingTotal, markupAmt, profit: markupAmt };
  }, [rows]);

  return (
    <div className="page wide" style={{paddingLeft:24, paddingRight:24, maxWidth:"none"}}>
      <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--text-3)", fontSize:12}}>
            <Icon name="estimate" size={12}/> Marina Heights Tower — Annual FM · Draft v3
          </div>
          <h1 className="page-title">Estimate Builder</h1>
          <p className="page-sub">BOQ-style line items with automatic markup. Edits autosave.</p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="fileText" size={14}/> Export PDF</button>
          <button className="btn"><Icon name="download" size={14}/> Export Excel</button>
          <button className="btn" onClick={() => { push("Estimate saved"); }}><Icon name="check" size={14}/> Save</button>
          <button className="btn primary" onClick={() => setGenOpen(true)}><Icon name="sparkles" size={14}/> Generate quotation draft</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{marginTop:16, gridTemplateColumns:"repeat(4, 1fr)"}}>
        <div className="stat">
          <div className="label">Direct Cost</div>
          <div className="value mono">{fmtAED(totals.directCost)}</div>
          <div className="delta">{rows.length} line items</div>
        </div>
        <div className="stat">
          <div className="label">Markup Amount</div>
          <div className="value mono">{fmtAED(totals.markupAmt)}</div>
          <div className="delta">avg {((totals.markupAmt / Math.max(totals.directCost,1)) * 100).toFixed(1)}%</div>
        </div>
        <div className="stat" style={{background:"var(--text)", color:"var(--bg)", borderColor:"var(--text)"}}>
          <div className="label" style={{color:"rgba(255,255,255,0.6)"}}>Selling Total</div>
          <div className="value mono">{fmtAED(totals.sellingTotal)}</div>
          <div className="delta" style={{color:"rgba(255,255,255,0.55)"}}>VAT excluded</div>
        </div>
        <div className="stat">
          <div className="label">Estimated Profit</div>
          <div className="value mono" style={{color:"var(--t-green-fg)"}}>{fmtAED(totals.profit)}</div>
          <div className="delta">before overhead</div>
        </div>
      </div>

      {/* Main two-column */}
      <div style={{display:"grid", gridTemplateColumns:"minmax(0, 1fr) 380px", gap:18, marginTop:20}}>
        <div className="card" style={{padding:0, overflow:"hidden"}}>
          {/* toolbar */}
          <div style={{display:"flex", alignItems:"center", gap:8, padding:"10px 14px", borderBottom:"1px solid var(--border)"}}>
            <div className="tb-search" style={{width:200}}>
              <Icon name="search" size={14}/>
              <input placeholder="Filter items…"/>
            </div>
            <select className="input" style={{width:140}} value={cat} onChange={e => setCat(e.target.value)}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{flex:1}}></div>
            <button className="btn ghost sm" onClick={() => setPickRate(true)}><Icon name="rates" size={14}/> Pull from library</button>
            <button className="btn sm" onClick={addRow}><Icon name="plus" size={14}/> Add row</button>
          </div>

          <div style={{overflowX:"auto"}}>
            <table className="table boq-table" style={{minWidth:1100}}>
              <thead>
                <tr>
                  <th style={{width:70, paddingLeft:14}}>Item</th>
                  <th>Description</th>
                  <th style={{width:120}}>Category</th>
                  <th style={{width:70}}>Unit</th>
                  <th style={{width:70, textAlign:"right"}}>Qty</th>
                  <th style={{width:90, textAlign:"right"}}>Unit Cost</th>
                  <th style={{width:70, textAlign:"right"}}>Mkup %</th>
                  <th style={{width:90, textAlign:"right"}}>Selling</th>
                  <th style={{width:100, textAlign:"right"}}>Total</th>
                  <th style={{width:40}}></th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => {
                  const selling = (r.cost || 0) * (1 + (r.markup || 0)/100);
                  const total = (r.qty || 0) * selling;
                  return (
                    <tr key={r.id}>
                      <td className="mono" style={{paddingLeft:14, color:"var(--text-2)", fontSize:12}}>{r.item}</td>
                      <td>
                        <input value={r.desc} onChange={e => update(r.id, "desc", e.target.value)}/>
                        {r.notes && <div style={{fontSize:11, color:"var(--text-3)", marginLeft:6}}>{r.notes}</div>}
                      </td>
                      <td><span className={"pill " + (scopeTint[r.category] || "gray")}>{r.category}</span></td>
                      <td><input value={r.unit} onChange={e => update(r.id, "unit", e.target.value)} className="mono" style={{fontSize:12}}/></td>
                      <td><input type="number" value={r.qty} onChange={e => update(r.id, "qty", +e.target.value)} className="mono" style={{textAlign:"right"}}/></td>
                      <td><input type="number" value={r.cost} onChange={e => update(r.id, "cost", +e.target.value)} className="mono" style={{textAlign:"right"}}/></td>
                      <td><input type="number" value={r.markup} onChange={e => update(r.id, "markup", +e.target.value)} className="mono" style={{textAlign:"right"}}/></td>
                      <td className="mono" style={{textAlign:"right", color:"var(--text-2)"}}>{fmtNum(selling)}</td>
                      <td className="mono" style={{textAlign:"right", fontWeight:500}}>{fmtNum(total)}</td>
                      <td>
                        <div className="row-tools">
                          <button title="Duplicate" onClick={() => dupe(r.id)}><Icon name="copy" size={13}/></button>
                          <button title="Delete" onClick={() => del(r.id)}><Icon name="trash" size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={10} style={{padding:0}}>
                    <button className="btn ghost sm" style={{width:"100%", justifyContent:"flex-start", padding:"10px 18px", borderRadius:0, color:"var(--text-3)"}} onClick={addRow}>
                      <Icon name="plus" size={13}/> Add line item
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={8} style={{textAlign:"right", paddingRight:14, paddingTop:14, paddingBottom:14, color:"var(--text-3)", fontSize:12, textTransform:"uppercase", letterSpacing:"0.04em"}}>Subtotal</td>
                  <td className="mono" style={{textAlign:"right", paddingTop:14, paddingBottom:14, fontWeight:600, fontSize:14}}>{fmtAED(totals.sellingTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Quotation preview */}
        <div className="quot">
          <div className="qbrand">
            <div style={{width:28, height:28, borderRadius:6, background:"var(--text)", color:"var(--bg)", display:"grid", placeItems:"center", fontWeight:700, fontSize:12}}>A</div>
            <div>
              <div style={{fontWeight:700, fontSize:13}}>Ahmed's Hub</div>
              <div style={{fontSize:10, color:"var(--text-3)"}}>FM Estimation · Dubai, UAE</div>
            </div>
            <div style={{marginLeft:"auto", textAlign:"right"}}>
              <div className="mono" style={{fontSize:11, fontWeight:600}}>QTN-2026-0142</div>
              <div style={{fontSize:10, color:"var(--text-3)"}}>16 May 2026</div>
            </div>
          </div>

          <h4>Marina Heights Tower</h4>
          <div style={{fontSize:11, color:"var(--text-3)"}}>Annual Facilities Management — Cleaning, HVAC PPM & Pest Control</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14, fontSize:11}}>
            <div>
              <div style={{color:"var(--text-3)", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.04em"}}>Bill to</div>
              <div style={{fontWeight:500, marginTop:2}}>Damac Properties</div>
              <div style={{color:"var(--text-2)"}}>Procurement Dept.<br/>Dubai Marina</div>
            </div>
            <div>
              <div style={{color:"var(--text-3)", fontSize:9.5, textTransform:"uppercase", letterSpacing:"0.04em"}}>Valid until</div>
              <div style={{fontWeight:500, marginTop:2}}>30 June 2026</div>
              <div style={{color:"var(--text-2)"}}>Terms: 30 days net</div>
            </div>
          </div>

          <table style={{marginTop:14}}>
            <thead>
              <tr><th>Item</th><th style={{textAlign:"right"}}>Qty</th><th style={{textAlign:"right"}}>Rate</th><th style={{textAlign:"right"}}>Total</th></tr>
            </thead>
            <tbody>
              {rows.slice(0,5).map(r => (
                <tr key={r.id}>
                  <td style={{paddingRight:6}}>{r.desc.length > 36 ? r.desc.slice(0,36) + "…" : r.desc}</td>
                  <td className="mono" style={{textAlign:"right"}}>{r.qty}</td>
                  <td className="mono" style={{textAlign:"right", color:"var(--text-2)"}}>{fmtNum(r.cost * (1 + r.markup/100))}</td>
                  <td className="mono" style={{textAlign:"right"}}>{fmtNum(r.qty * r.cost * (1 + r.markup/100))}</td>
                </tr>
              ))}
              {rows.length > 5 && (
                <tr><td colSpan={4} style={{textAlign:"center", color:"var(--text-3)", fontSize:10.5}}>+ {rows.length - 5} more items</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{textAlign:"right", color:"var(--text-3)"}}>Subtotal</td>
                <td className="mono" style={{textAlign:"right"}}>{fmtNum(totals.sellingTotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{textAlign:"right", color:"var(--text-3)", borderTop:"none", paddingTop:2}}>VAT 5%</td>
                <td className="mono" style={{textAlign:"right", borderTop:"none", paddingTop:2}}>{fmtNum(totals.sellingTotal * 0.05)}</td>
              </tr>
              <tr>
                <td colSpan={3} style={{textAlign:"right"}}>Total (AED)</td>
                <td className="mono" style={{textAlign:"right"}}>{fmtNum(totals.sellingTotal * 1.05)}</td>
              </tr>
            </tfoot>
          </table>

          <div style={{marginTop:14, paddingTop:10, borderTop:"1px dashed var(--border-strong)", fontSize:10, color:"var(--text-3)", lineHeight:1.55}}>
            <b style={{color:"var(--text-2)"}}>Assumptions:</b> Working hours Mon–Sat, 06:00–18:00. Consumables included. Specialist works excluded.<br/>
            <b style={{color:"var(--text-2)", marginTop:6, display:"inline-block"}}>Validity:</b> 45 days from issue.
          </div>
        </div>
      </div>

      {/* Pick from library */}
      <Modal open={pickRate} onClose={() => setPickRate(false)} title="Pull from Rate Library" subtitle="Add saved rates to this estimate"
             size="lg"
             footer={<><button className="btn" onClick={() => setPickRate(false)}>Cancel</button><button className="btn primary" onClick={() => { setPickRate(false); push("Added 2 items from library"); }}>Add selected</button></>}>
        <div className="tb-search" style={{width:"100%", marginBottom:10}}>
          <Icon name="search" size={14}/>
          <input placeholder="Search the rate library…" autoFocus/>
        </div>
        <div style={{maxHeight:340, overflowY:"auto", border:"1px solid var(--border)", borderRadius:6}}>
          {RATES.slice(0,8).map(r => (
            <div key={r.id} style={{display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderBottom:"1px solid var(--border)"}}>
              <input type="checkbox" style={{width:16, height:16}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:500, fontSize:13}}>{r.name}</div>
                <div style={{color:"var(--text-3)", fontSize:11.5}}>{r.source} · {r.unit}</div>
              </div>
              <span className={"pill " + (scopeTint[r.category] || "gray")}>{r.category}</span>
              <span className="mono" style={{minWidth:80, textAlign:"right", fontWeight:500}}>{fmtAED(r.rate)}</span>
            </div>
          ))}
        </div>
      </Modal>

      {/* Generate quotation */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Generate quotation draft" subtitle="A polished PDF using your template & current line items"
             footer={<><button className="btn" onClick={() => setGenOpen(false)}>Cancel</button><button className="btn primary" onClick={() => { setGenOpen(false); push("Quotation draft created"); }}><Icon name="sparkles" size={14}/> Generate</button></>}>
        <div className="col gap-12">
          <div className="field">
            <label>Quotation number</label>
            <input className="input mono" defaultValue="QTN-2026-0142"/>
          </div>
          <div className="grid-2">
            <div className="field"><label>Validity</label><input className="input" defaultValue="45 days"/></div>
            <div className="field"><label>Payment terms</label><input className="input" defaultValue="30 days net"/></div>
          </div>
          <div className="field">
            <label>Cover letter</label>
            <textarea className="input" rows={4} defaultValue="Dear Procurement Team,&#10;&#10;Please find attached our quotation for Marina Heights Tower annual FM services. We've costed against actual site data captured during our visit on 14 May. Happy to walk you through any line item."></textarea>
          </div>
          <label style={{display:"flex", alignItems:"center", gap:8, fontSize:13}}>
            <input type="checkbox" defaultChecked/> Include assumptions & exclusions sheet
          </label>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { EstimateBuilder });
