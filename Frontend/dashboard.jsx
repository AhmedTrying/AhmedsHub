/* global React, Icon, PROJECTS, ACTIVITY, fmtAED, statusTint, scopeTint */

const QuickAction = ({ icon, label, sub, onClick }) => (
  <button className="card tight" onClick={onClick}
          style={{display:"flex", alignItems:"center", gap:12, textAlign:"left", cursor:"pointer", background:"var(--surface)"}}>
    <div style={{width:36, height:36, borderRadius:8, background:"var(--surface-2)", display:"grid", placeItems:"center", color:"var(--text)"}}>
      <Icon name={icon} size={17}/>
    </div>
    <div style={{flex:1, minWidth:0}}>
      <div style={{fontWeight:500, fontSize:13.5}}>{label}</div>
      <div style={{color:"var(--text-3)", fontSize:11.5}}>{sub}</div>
    </div>
    <Icon name="chev" size={14}/>
  </button>
);

const Dashboard = ({ goto, openNewProject, openNewRate }) => {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const date = new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" });

  const activeRfqs = PROJECTS.filter(p => ["New","Site Visit","Pricing","Quotation Sent","Follow Up"].includes(p.status));
  const todays = PROJECTS.slice(0,3);

  return (
    <div className="page">
      <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:6}}>
        <div>
          <div style={{color:"var(--text-3)", fontSize:13, marginBottom:6}}>{date}</div>
          <h1 className="page-title">{greeting}, Ahmed.</h1>
          <p className="page-sub">You've got <b style={{color:"var(--text)"}}>3 quotations</b> to finalize and <b style={{color:"var(--text)"}}>1 site visit</b> on Thursday. Let's get to it.</p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn" onClick={() => goto("notes")}>
            <Icon name="notes" size={14}/> Quick note
          </button>
          <button className="btn primary" onClick={openNewProject}>
            <Icon name="plus" size={14}/> New project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{marginTop:16}}>
        <div className="stat">
          <div className="label"><Icon name="projects" size={13}/> Active Projects</div>
          <div className="value">8</div>
          <div className="delta up">+2 this week</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="estimate" size={13}/> Estimates Created</div>
          <div className="value">14</div>
          <div className="delta">3 in draft</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="clock" size={13}/> Pending Follow-ups</div>
          <div className="value">5</div>
          <div className="delta down">2 overdue</div>
        </div>
        <div className="stat">
          <div className="label"><Icon name="rates" size={13}/> Saved Rate Items</div>
          <div className="value">68</div>
          <div className="delta">12 added this month</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{marginTop:24}}>
        <div className="section-h"><h2>Quick actions</h2></div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10}}>
          <QuickAction icon="projects" label="New project" sub="Start a fresh RFQ" onClick={openNewProject}/>
          <QuickAction icon="estimate" label="New estimate" sub="Open the BOQ builder" onClick={() => goto("estimate")}/>
          <QuickAction icon="rates" label="Add a rate" sub="Save to your library" onClick={openNewRate}/>
          <QuickAction icon="site" label="Site visit note" sub="Checklist + photos" onClick={() => goto("site")}/>
        </div>
      </div>

      {/* Today's focus + activity */}
      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginTop:24}}>
        <div className="card">
          <div className="section-h">
            <h2>Today's focus</h2>
            <button className="btn ghost sm" onClick={() => goto("projects")}>View all<Icon name="chev" size={12}/></button>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:2}}>
            {todays.map((p, i) => (
              <div key={p.id} onClick={() => goto("project:" + p.id)}
                   style={{display:"flex", alignItems:"center", gap:12, padding:"10px 4px", borderRadius:6, cursor:"pointer", borderTop: i ? "1px solid var(--border)" : "none"}}>
                <div style={{width:6, height:6, borderRadius:"50%", background: p.priority === "High" ? "#D9534F" : p.priority === "Medium" ? "#E8A33A" : "#9B9A93"}}></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:500, fontSize:13.5}}>{p.name}</div>
                  <div style={{color:"var(--text-3)", fontSize:12, marginTop:2}}>{p.next}</div>
                </div>
                <span className={"pill " + statusTint[p.status]}>{p.status}</span>
                <div style={{width:80, textAlign:"right", fontFamily:"Geist Mono, monospace", fontSize:12, color:"var(--text-2)"}}>
                  {p.value ? fmtAED(p.value) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-h">
            <h2>Recent activity</h2>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{display:"flex", gap:10}}>
                <div style={{width:24, height:24, borderRadius:6, background:"var(--surface-2)", display:"grid", placeItems:"center", color:"var(--text-2)", flexShrink:0}}>
                  <Icon name={a.icon} size={13}/>
                </div>
                <div style={{fontSize:12.5, lineHeight:1.4}}>
                  <b style={{fontWeight:500}}>{a.who}</b> <span className="muted">{a.what}</span> <b style={{fontWeight:500}}>{a.on}</b>
                  <div style={{color:"var(--text-3)", fontSize:11.5, marginTop:2}}>{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active RFQs + this week */}
      <div style={{display:"grid", gridTemplateColumns:"3fr 2fr", gap:16, marginTop:16}}>
        <div className="card">
          <div className="section-h">
            <h2>Active RFQs</h2>
            <button className="btn ghost sm" onClick={() => goto("rfq")}>Open board<Icon name="chev" size={12}/></button>
          </div>
          <table className="table">
            <thead><tr><th>Project</th><th>Client</th><th>Status</th><th style={{textAlign:"right"}}>Value</th></tr></thead>
            <tbody>
              {activeRfqs.slice(0,5).map(p => (
                <tr key={p.id} onClick={() => goto("project:" + p.id)} style={{cursor:"pointer"}}>
                  <td className="name">{p.name}</td>
                  <td className="muted">{p.client}</td>
                  <td><span className={"pill " + statusTint[p.status]}><span className="dot"></span>{p.status}</span></td>
                  <td className="mono" style={{textAlign:"right"}}>{p.value ? fmtAED(p.value) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-h">
            <h2>This week</h2>
            <span className="muted" style={{fontSize:12}}>May 18–24</span>
          </div>
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            <div style={{display:"flex", gap:12, padding:"8px 0", borderBottom:"1px solid var(--border)"}}>
              <div style={{width:40, textAlign:"center"}}>
                <div className="mono" style={{fontSize:18, fontWeight:600}}>18</div>
                <div style={{fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.04em"}}>Mon</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:500}}>Al Quoz Warehouse — site visit</div>
                <div style={{color:"var(--text-3)", fontSize:12}}>15:00 · Bring measuring wheel</div>
              </div>
            </div>
            <div style={{display:"flex", gap:12, padding:"8px 0", borderBottom:"1px solid var(--border)"}}>
              <div style={{width:40, textAlign:"center"}}>
                <div className="mono" style={{fontSize:18, fontWeight:600}}>20</div>
                <div style={{fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.04em"}}>Wed</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:500}}>JLT — quotation due</div>
                <div style={{color:"var(--text-3)", fontSize:12}}>Submit before 17:00</div>
              </div>
            </div>
            <div style={{display:"flex", gap:12, padding:"8px 0"}}>
              <div style={{width:40, textAlign:"center"}}>
                <div className="mono" style={{fontSize:18, fontWeight:600}}>22</div>
                <div style={{fontSize:10, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.04em"}}>Fri</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13, fontWeight:500}}>Marina Heights — follow-up call</div>
                <div style={{color:"var(--text-3)", fontSize:12}}>10:30 · Procurement team</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard });
