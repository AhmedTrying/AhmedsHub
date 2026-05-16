/* global React, Icon, CHECKLIST_SEED, ToastContext */

const SiteVisit = () => {
  const { push } = React.useContext(ToastContext);
  const [groups, setGroups] = React.useState(CHECKLIST_SEED);
  const [activeGroup, setActiveGroup] = React.useState("General");
  const [notes, setNotes] = React.useState("Met building manager. Walked plantrooms and BoH. Filters replaced 4 months ago — 3 units on L12 need attention.");

  const toggle = (g, id) => {
    setGroups(gs => ({
      ...gs,
      [g]: gs[g].map(c => c.id === id ? {...c, done: !c.done} : c)
    }));
  };
  const total = Object.values(groups).reduce((s, arr) => s + arr.length, 0);
  const done = Object.values(groups).reduce((s, arr) => s + arr.filter(c => c.done).length, 0);
  const pct = Math.round(done / total * 100);

  return (
    <div className="page wide">
      <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between"}}>
        <div>
          <div style={{color:"var(--text-3)", fontSize:12, display:"flex", alignItems:"center", gap:6}}>
            <Icon name="site" size={12}/> Site Visit Mode · Al Quoz Warehouse · 14 May 2026
          </div>
          <h1 className="page-title">Site visit checklist</h1>
          <p className="page-sub">Tick off as you go. Convert notes to estimate assumptions when you're done.</p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="camera" size={14}/> Add photos</button>
          <button className="btn primary" onClick={() => push("Notes converted to 6 assumptions")}>
            <Icon name="sparkles" size={14}/> Convert to assumptions
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="card tight" style={{marginTop:16, display:"flex", alignItems:"center", gap:18}}>
        <div style={{flex:1}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:12.5}}>
            <span style={{fontWeight:500}}>Overall progress</span>
            <span className="muted mono">{done}/{total} items · {pct}%</span>
          </div>
          <div style={{height:6, borderRadius:99, background:"var(--surface-2)", overflow:"hidden"}}>
            <div style={{width:pct+"%", height:"100%", background:"var(--text)", transition:"width 0.3s"}}></div>
          </div>
        </div>
        <div style={{display:"flex", gap:6}}>
          {Object.entries(groups).map(([g, items]) => {
            const d = items.filter(c => c.done).length;
            return (
              <div key={g} style={{textAlign:"center", padding:"6px 10px", borderRadius:6, background: d === items.length ? "var(--t-green-bg)" : "var(--surface-2)", color: d === items.length ? "var(--t-green-fg)" : "var(--text-2)", fontSize:11}}>
                <div style={{fontWeight:600, fontSize:13}} className="mono">{d}/{items.length}</div>
                <div>{g}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"200px 1fr 320px", gap:16, marginTop:16}}>
        {/* Group nav */}
        <div className="card tight">
          <div className="section-h" style={{marginBottom:6}}><h2>Sections</h2></div>
          {Object.keys(groups).map(g => (
            <button key={g} className={"sb-item" + (activeGroup === g ? " active" : "")} onClick={() => setActiveGroup(g)}>
              <span>{g}</span>
              <span className="count">{groups[g].filter(c => c.done).length}/{groups[g].length}</span>
            </button>
          ))}
        </div>

        {/* Checklist */}
        <div className="card">
          <div className="section-h">
            <h2>{activeGroup}</h2>
            <button className="btn ghost sm"><Icon name="plus" size={12}/> Add item</button>
          </div>
          {groups[activeGroup].map(item => (
            <div key={item.id} className={"check" + (item.done ? " done" : "")} onClick={() => toggle(activeGroup, item.id)}>
              <input type="checkbox" checked={item.done} onChange={() => toggle(activeGroup, item.id)}/>
              <label>{item.text}</label>
              {item.done && <Icon name="check" size={12}/>}
            </div>
          ))}
        </div>

        {/* Notes & photos */}
        <div className="col">
          <div className="card tight">
            <div className="section-h"><h2>Field notes</h2></div>
            <textarea className="input" rows={6} value={notes} onChange={e => setNotes(e.target.value)} style={{resize:"vertical"}}></textarea>
            <div style={{marginTop:8, display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--text-3)"}}>
              <span>Autosaved</span>
              <span>{notes.length} chars</span>
            </div>
          </div>

          <div className="card tight">
            <div className="section-h"><h2>Photos</h2><span className="muted" style={{fontSize:12}}>4</span></div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:6}}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{aspectRatio:"1/1", borderRadius:6, background:"var(--surface-2)", border:"1px dashed var(--border-strong)", display:"grid", placeItems:"center", color:"var(--text-3)", fontSize:10}} className="mono">PHOTO {i}</div>
              ))}
            </div>
            <button className="btn" style={{width:"100%", justifyContent:"center", marginTop:8}}>
              <Icon name="plus" size={13}/> Upload
            </button>
          </div>

          <div className="card tight">
            <div className="section-h"><h2>Quick info</h2></div>
            <div style={{display:"flex", flexDirection:"column", gap:6, fontSize:12.5}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><span className="subtle">Site contact</span><span style={{fontWeight:500}}>Mr. Khaled</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span className="subtle">Phone</span><span className="mono">+971 50 ••• 2244</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span className="subtle">GFA</span><span className="mono">34,000 sqm</span></div>
              <div style={{display:"flex", justifyContent:"space-between"}}><span className="subtle">Hours</span><span>06:00–18:00</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { SiteVisit });
