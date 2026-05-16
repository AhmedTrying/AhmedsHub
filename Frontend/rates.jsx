/* global React, Icon, RATES, scopeTint, fmtAED, ToastContext, Modal */

const RATE_CATS = ["All", "Cleaning", "HVAC", "Electrical", "Plumbing", "Civil", "Manpower", "Consumables", "Safety", "Pest Control"];

const RateLibrary = () => {
  const { push } = React.useContext(ToastContext);
  const [cat, setCat] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [view, setView] = React.useState("table");
  const filtered = RATES.filter(r =>
    (cat === "All" || r.category === cat) &&
    (q === "" || (r.name + r.source).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="page wide">
      <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between"}}>
        <div>
          <h1 className="page-title">Rate Library</h1>
          <p className="page-sub">Your personal database of FM rates. Click any rate to use it in an estimate.</p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="download" size={14}/> Import CSV</button>
          <button className="btn primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={14}/> Add rate</button>
        </div>
      </div>

      <div className="filterbar">
        <div className="tb-search" style={{width:280}}>
          <Icon name="search" size={14}/>
          <input placeholder="Search rates…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        {RATE_CATS.map(c => (
          <button key={c} className={"chip" + (cat === c ? " active" : "")} onClick={() => setCat(c)}>
            {c}
            {cat !== c && c !== "All" && <span style={{color:"var(--text-3)", fontSize:11}}>{RATES.filter(r => r.category === c).length}</span>}
          </button>
        ))}
        <div style={{flex:1}}></div>
        <div style={{display:"flex", border:"1px solid var(--border)", borderRadius:6, overflow:"hidden"}}>
          <button className="btn ghost sm" onClick={() => setView("table")} style={{borderRadius:0, background: view === "table" ? "var(--surface-hover)" : "transparent"}}>
            Table
          </button>
          <button className="btn ghost sm" onClick={() => setView("grid")} style={{borderRadius:0, background: view === "grid" ? "var(--surface-hover)" : "transparent"}}>
            Cards
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="card tight" style={{padding:0, overflow:"hidden"}}>
          <table className="table">
            <thead>
              <tr>
                <th style={{paddingLeft:18}}>Item</th>
                <th>Category</th>
                <th>Unit</th>
                <th style={{textAlign:"right"}}>Avg rate</th>
                <th>Supplier / source</th>
                <th>Last used</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="name" style={{paddingLeft:18}}>
                    {r.name}
                    {r.notes && <div style={{fontSize:11.5, color:"var(--text-3)", marginTop:2}}>{r.notes}</div>}
                  </td>
                  <td><span className={"pill " + (scopeTint[r.category] || "gray")}>{r.category}</span></td>
                  <td className="muted mono" style={{fontSize:12}}>{r.unit}</td>
                  <td className="mono" style={{textAlign:"right", fontWeight:500}}>{fmtAED(r.rate)}</td>
                  <td className="muted">{r.source}</td>
                  <td className="muted" style={{fontSize:12}}>{r.last}</td>
                  <td>
                    <button className="btn ghost sm" onClick={() => push("Added '" + r.name + "' to estimate")}>
                      Use <Icon name="arrowRight" size={12}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12}}>
          {filtered.map(r => (
            <div key={r.id} className="card tight">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <span className={"pill " + (scopeTint[r.category] || "gray")}>{r.category}</span>
                <button className="btn ghost sm" style={{padding:2}}><Icon name="more" size={14}/></button>
              </div>
              <div style={{fontWeight:500, fontSize:14, marginTop:10}}>{r.name}</div>
              <div style={{color:"var(--text-3)", fontSize:12, marginTop:2}}>{r.source}</div>
              <div style={{display:"flex", alignItems:"baseline", gap:6, marginTop:12}}>
                <div className="mono" style={{fontSize:22, fontWeight:600, letterSpacing:"-0.02em"}}>{fmtAED(r.rate)}</div>
                <div style={{color:"var(--text-3)", fontSize:12}}>/ {r.unit}</div>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, paddingTop:10, borderTop:"1px solid var(--border)"}}>
                <span style={{fontSize:11.5, color:"var(--text-3)"}}>Last used {r.last}</span>
                <button className="btn sm" onClick={() => push("Added to estimate")}>Use</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add new rate" subtitle="Save a benchmark you can pull into any future estimate"
             footer={<><button className="btn" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn primary" onClick={() => { setAddOpen(false); push("Rate saved to library"); }}>Save rate</button></>}>
        <div className="col gap-12">
          <div className="field">
            <label>Item name</label>
            <input className="input" placeholder="e.g. AHU filter — pleated MERV 8" autoFocus/>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Category</label>
              <select className="input">{RATE_CATS.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}</select>
            </div>
            <div className="field">
              <label>Unit</label>
              <input className="input" placeholder="pc / sqm / month / visit"/>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Average rate (AED)</label>
              <input className="input mono" placeholder="0.00"/>
            </div>
            <div className="field">
              <label>Supplier / source</label>
              <input className="input" placeholder="e.g. Camfil ME"/>
            </div>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea className="input" rows={3} placeholder="Any context — bulk pricing, exclusions, etc."></textarea>
          </div>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { RateLibrary });
