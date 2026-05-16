/* global React, Icon, PROJECTS, statusTint, fmtAED, ToastContext, TEMPLATES */

const COLS = ["New", "Site Visit", "Pricing", "Quotation Sent", "Follow Up", "Won", "Lost"];

const RFQTracker = () => {
  const { push } = React.useContext(ToastContext);
  const [cards, setCards] = React.useState(() => {
    // Seed with multiple synthetic ones too so columns feel populated
    const seed = [...PROJECTS];
    seed.push(
      { id: "p9", name: "Dubai Hills Mall — Cleaning Top-Up", client: "Emaar Malls", status: "New", value: 0, priority: "Medium", dueDate: "May 24", next: "Receive scope by Thu" },
      { id: "p10", name: "Twofour54 HQ — HVAC Service", client: "Twofour54", status: "Site Visit", value: 0, priority: "High", dueDate: "May 18", next: "Site visit Sun 10am" },
      { id: "p11", name: "ADGM Tower Lobby Refresh", client: "ADGM", status: "Pricing", value: 0, priority: "Medium", dueDate: "May 21", next: "Confirm marble polish rate" },
      { id: "p12", name: "Sustainable City — Pest Control", client: "Diamond Developers", status: "Won", value: 124000, priority: "Low", dueDate: "—", next: "Mobilization week of 25 May" },
    );
    return seed;
  });
  const [dragId, setDragId] = React.useState(null);
  const [overCol, setOverCol] = React.useState(null);

  const byCol = COLS.reduce((m, c) => ({ ...m, [c]: cards.filter(p => p.status === c) }), {});

  const onDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e, col) => { e.preventDefault(); setOverCol(col); };
  const onDrop = (e, col) => {
    e.preventDefault();
    if (dragId) {
      const card = cards.find(c => c.id === dragId);
      if (card && card.status !== col) {
        setCards(cs => cs.map(c => c.id === dragId ? { ...c, status: col } : c));
        push(`Moved "${card.name}" → ${col}`);
      }
    }
    setDragId(null); setOverCol(null);
  };

  return (
    <div className="page wide" style={{maxWidth:"none", paddingLeft:24, paddingRight:24}}>
      <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between"}}>
        <div>
          <h1 className="page-title">RFQ / Quotation Tracker</h1>
          <p className="page-sub">Drag cards between columns to update status. {cards.length} active RFQs.</p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="filter" size={14}/> Filter</button>
          <button className="btn primary"><Icon name="plus" size={14}/> New RFQ</button>
        </div>
      </div>

      <div className="kanban" style={{marginTop:16}}>
        {COLS.map(col => (
          <div key={col} className="kcol"
               onDragOver={e => onDragOver(e, col)}
               onDrop={e => onDrop(e, col)}
               style={overCol === col ? {borderColor:"var(--accent)", background:"var(--accent-soft)"} : {}}>
            <div className="kcol-h">
              <span className={"pill " + statusTint[col]}><span className="dot"></span>{col}</span>
              <span className="count">{byCol[col].length}</span>
              <div style={{flex:1}}></div>
              <button className="tb-icon-btn" style={{width:22, height:22}}><Icon name="plus" size={12}/></button>
            </div>
            <div className="kcol-body">
              {byCol[col].map(p => (
                <div key={p.id}
                     className={"kcard" + (dragId === p.id ? " dragging" : "")}
                     draggable
                     onDragStart={e => onDragStart(e, p.id)}>
                  <div style={{display:"flex", alignItems:"flex-start", gap:6, marginBottom:6}}>
                    <div style={{width:5, height:5, borderRadius:"50%", marginTop:6, background: p.priority === "High" ? "#D9534F" : p.priority === "Medium" ? "#E8A33A" : "#9B9A93", flexShrink:0}}></div>
                    <div style={{flex:1}}>
                      <div className="ktitle">{p.name}</div>
                      <div className="kclient">{p.client}</div>
                    </div>
                  </div>
                  {p.next && (
                    <div style={{fontSize:11.5, color:"var(--text-2)", marginBottom:8, padding:"5px 7px", background:"var(--surface-2)", borderRadius:4, borderLeft:"2px solid var(--border-strong)"}}>
                      {p.next}
                    </div>
                  )}
                  <div className="kmeta">
                    <Icon name="clock" size={11}/>
                    <span>{p.dueDate}</span>
                    <div style={{flex:1}}></div>
                    {p.value > 0 && <span className="mono">{fmtAED(p.value)}</span>}
                  </div>
                </div>
              ))}
              {byCol[col].length === 0 && (
                <div style={{padding:"20px 8px", textAlign:"center", color:"var(--text-3)", fontSize:11.5, border:"1px dashed var(--border)", borderRadius:6}}>
                  Drop card here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ TEMPLATES ============
const Templates = () => {
  const { push } = React.useContext(ToastContext);
  return (
    <div className="page">
      <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between"}}>
        <div>
          <h1 className="page-title">Templates</h1>
          <p className="page-sub">Re-usable starting points so you never build the same estimate twice.</p>
        </div>
        <button className="btn primary"><Icon name="plus" size={14}/> New template</button>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginTop:18}}>
        {TEMPLATES.map(t => (
          <div key={t.id} className="card" style={{cursor:"pointer"}}>
            <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between"}}>
              <div style={{width:40, height:40, borderRadius:8, background:"var(--surface-2)", display:"grid", placeItems:"center", fontSize:18, border:"1px solid var(--border)"}}>{t.icon}</div>
              <button className="btn ghost sm"><Icon name="more" size={14}/></button>
            </div>
            <div style={{fontWeight:600, fontSize:14.5, marginTop:14, lineHeight:1.3}}>{t.name}</div>
            <div style={{color:"var(--text-2)", fontSize:12.5, marginTop:6, lineHeight:1.5}}>{t.desc}</div>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14, paddingTop:12, borderTop:"1px solid var(--border)"}}>
              <span style={{fontSize:11.5, color:"var(--text-3)"}}>{t.rows} rows · used {t.used}×</span>
              <button className="btn sm" onClick={() => push(`Created from "${t.name}"`)}>Use<Icon name="arrowRight" size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ SETTINGS ============
const Settings = ({ theme, setTheme }) => {
  const { push } = React.useContext(ToastContext);
  return (
    <div className="page" style={{maxWidth:840}}>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Personal preferences. Saved automatically.</p>

      <div className="col gap-12" style={{marginTop:18}}>
        <SettingRow label="Personal name" sub="Shown on quotations & exports">
          <input className="input" defaultValue="Ahmed H." style={{maxWidth:260}}/>
        </SettingRow>
        <SettingRow label="Currency" sub="Used across all estimates">
          <select className="input" defaultValue="AED" style={{maxWidth:160}}>
            <option>AED</option><option>USD</option><option>EUR</option><option>SAR</option><option>QAR</option>
          </select>
        </SettingRow>
        <SettingRow label="Default markup %" sub="Applied to new BOQ rows">
          <input className="input mono" defaultValue="20" style={{maxWidth:120}}/>
        </SettingRow>
        <SettingRow label="Default working hours" sub="Mon–Sat unless specified">
          <input className="input" defaultValue="06:00 – 18:00" style={{maxWidth:200}}/>
        </SettingRow>
        <SettingRow label="Theme" sub="Choose how the app looks">
          <div style={{display:"flex", gap:6}}>
            {["light", "dark"].map(t => (
              <button key={t} className={"btn sm" + (theme === t ? " primary" : "")} onClick={() => setTheme(t)}>
                <Icon name={t === "light" ? "sun" : "moon"} size={12}/> {t === "light" ? "Light" : "Dark"}
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label="Export defaults" sub="Default format & branding">
          <select className="input" defaultValue="PDF" style={{maxWidth:160}}>
            <option>PDF</option><option>Excel</option><option>Both</option>
          </select>
        </SettingRow>
        <SettingRow label="Notification sounds" sub="Toast confirmations & due-date alerts">
          <Toggle/>
        </SettingRow>
      </div>

      <div className="divider"></div>

      <div className="card" style={{background:"var(--bg-soft)"}}>
        <div className="section-h">
          <h2>Data</h2>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="download" size={14}/> Export all data</button>
          <button className="btn"><Icon name="fileText" size={14}/> Import from CSV</button>
          <button className="btn" style={{color:"var(--t-red-fg)"}} onClick={() => push("Use with care — this would reset all data")}>
            <Icon name="trash" size={14}/> Reset workspace
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingRow = ({ label, sub, children }) => (
  <div style={{display:"flex", alignItems:"center", gap:18, padding:"14px 0", borderBottom:"1px solid var(--border)"}}>
    <div style={{flex:1}}>
      <div style={{fontWeight:500, fontSize:14}}>{label}</div>
      <div style={{color:"var(--text-3)", fontSize:12.5, marginTop:2}}>{sub}</div>
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = () => {
  const [on, setOn] = React.useState(true);
  return (
    <button onClick={() => setOn(!on)}
            style={{width:34, height:20, borderRadius:99, border:"none",
                    background: on ? "var(--text)" : "var(--border-strong)",
                    position:"relative", cursor:"pointer", padding:0}}>
      <div style={{width:14, height:14, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left: on ? 17 : 3, transition:"left 0.15s"}}></div>
    </button>
  );
};

Object.assign(window, { RFQTracker, Templates, Settings });
