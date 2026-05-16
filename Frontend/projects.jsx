/* global React, Icon, PROJECTS, fmtAED, statusTint, scopeTint, CHECKLIST_SEED */

const STATUSES = ["All", "New", "Site Visit", "Pricing", "Quotation Sent", "Follow Up", "Won", "Lost"];

const Projects = ({ goto }) => {
  const [filter, setFilter] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [view, setView] = React.useState("table"); // table | board
  const filtered = PROJECTS.filter(p =>
    (filter === "All" || p.status === filter) &&
    (q === "" || (p.name + p.client + p.location).toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <div className="page wide">
      <div style={{display:"flex", alignItems:"flex-end", justifyContent:"space-between"}}>
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">All active and archived RFQs you're working on.</p>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="download" size={14}/> Export</button>
          <button className="btn primary" onClick={() => goto("project:p1")}><Icon name="plus" size={14}/> New project</button>
        </div>
      </div>

      <div className="filterbar">
        <div className="tb-search" style={{width:280}}>
          <Icon name="search" size={14}/>
          <input placeholder="Search projects…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        {STATUSES.map(s => (
          <button key={s} className={"chip" + (filter === s ? " active" : "")} onClick={() => setFilter(s)}>
            {s}
            {filter !== s && s !== "All" && (
              <span style={{color:"var(--text-3)", fontSize:11}}>
                {PROJECTS.filter(p => p.status === s).length}
              </span>
            )}
          </button>
        ))}
        <div style={{flex:1}}></div>
        <button className="btn"><Icon name="filter" size={14}/> Scope</button>
        <div style={{display:"flex", gap:0, border:"1px solid var(--border)", borderRadius:6, overflow:"hidden"}}>
          <button className={"btn ghost sm"} onClick={() => setView("table")}
                  style={{borderRadius:0, background: view === "table" ? "var(--surface-hover)" : "transparent"}}>
            <Icon name="rates" size={14}/> Table
          </button>
          <button className={"btn ghost sm"} onClick={() => setView("board")}
                  style={{borderRadius:0, background: view === "board" ? "var(--surface-hover)" : "transparent"}}>
            <Icon name="kanban" size={14}/> Board
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div className="card tight" style={{padding:0, overflow:"hidden"}}>
          <table className="table">
            <thead>
              <tr>
                <th style={{paddingLeft:18, width:"30%"}}>Project</th>
                <th>Client</th>
                <th>Location</th>
                <th>Scope</th>
                <th>Status</th>
                <th style={{textAlign:"right"}}>Value</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => goto("project:" + p.id)} style={{cursor:"pointer"}}>
                  <td className="name" style={{paddingLeft:18}}>
                    <div style={{display:"flex", alignItems:"center", gap:10}}>
                      <div style={{width:6, height:6, borderRadius:"50%", background: p.priority === "High" ? "#D9534F" : p.priority === "Medium" ? "#E8A33A" : "#9B9A93"}}></div>
                      {p.name}
                    </div>
                  </td>
                  <td className="muted">{p.client}</td>
                  <td className="muted">{p.location}</td>
                  <td>
                    <div style={{display:"flex", gap:4, flexWrap:"wrap"}}>
                      {p.scope.map(s => <span key={s} className={"pill " + scopeTint[s]}>{s}</span>)}
                    </div>
                  </td>
                  <td><span className={"pill " + statusTint[p.status]}><span className="dot"></span>{p.status}</span></td>
                  <td className="mono" style={{textAlign:"right"}}>{p.value ? fmtAED(p.value) : "—"}</td>
                  <td className="muted" style={{fontSize:12}}>{p.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty">No projects match your filters.</div>}
        </div>
      ) : (
        <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12}}>
          {filtered.map(p => (
            <div key={p.id} className="card tight" style={{cursor:"pointer"}} onClick={() => goto("project:" + p.id)}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span className={"pill " + statusTint[p.status]}><span className="dot"></span>{p.status}</span>
                <Icon name="more" size={14}/>
              </div>
              <div style={{fontWeight:600, fontSize:14, marginTop:10, lineHeight:1.3}}>{p.name}</div>
              <div style={{color:"var(--text-3)", fontSize:12, marginTop:2}}>{p.client}</div>
              <div style={{display:"flex", gap:4, flexWrap:"wrap", marginTop:10}}>
                {p.scope.map(s => <span key={s} className={"pill " + scopeTint[s]}>{s}</span>)}
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, paddingTop:10, borderTop:"1px solid var(--border)"}}>
                <span style={{fontSize:11.5, color:"var(--text-3)"}}>{p.location}</span>
                <span className="mono" style={{fontSize:12, fontWeight:500}}>{p.value ? fmtAED(p.value) : "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =========== PROJECT DETAIL ===========
const ProjectDetail = ({ id, goto, openEstimate }) => {
  const p = PROJECTS.find(x => x.id === id) || PROJECTS[0];
  const [tab, setTab] = React.useState("Notes");
  const tabs = ["Notes", "Estimate", "Site Visit", "Tasks", "Files"];
  const initial = p.name[0];

  return (
    <div className="page wide">
      <div style={{display:"flex", alignItems:"center", gap:8, color:"var(--text-2)", fontSize:13}}>
        <button className="btn ghost sm" onClick={() => goto("projects")}>← Projects</button>
        <span className="muted">/</span>
        <span>{p.client}</span>
      </div>

      <div className="proj-hero">
        <div className="proj-cover" style={{background:"var(--surface-2)", border:"1px solid var(--border)"}}>{initial}</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:"flex", alignItems:"center", gap:10, flexWrap:"wrap"}}>
            <h1>{p.name}</h1>
            <span className={"pill " + statusTint[p.status]}><span className="dot"></span>{p.status}</span>
          </div>
          <div className="meta">
            <span><Icon name="user" size={12}/> {p.client}</span>
            <span>·</span>
            <span><Icon name="map" size={12}/> {p.location}</span>
            <span>·</span>
            <span><Icon name="clock" size={12}/> Due {p.dueDate}</span>
            <span>·</span>
            <span className="mono" style={{fontWeight:500, color:"var(--text)"}}>{p.value ? fmtAED(p.value) : "Not estimated"}</span>
          </div>
          <div style={{display:"flex", gap:4, marginTop:10}}>
            {p.scope.map(s => <span key={s} className={"pill " + scopeTint[s]}>{s}</span>)}
          </div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="btn"><Icon name="download" size={14}/> Export</button>
          <button className="btn primary" onClick={openEstimate}><Icon name="calc" size={14}/> Open estimate</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={"tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 320px", gap:18}}>
        <div>
          {tab === "Notes" && <ProjectNotesTab p={p}/>}
          {tab === "Estimate" && <ProjectEstimateTab p={p} onOpen={openEstimate}/>}
          {tab === "Site Visit" && <ProjectSiteVisitTab/>}
          {tab === "Tasks" && <ProjectTasksTab/>}
          {tab === "Files" && <ProjectFilesTab/>}
        </div>

        <aside className="col">
          <div className="card tight">
            <div className="section-h"><h2>Overview</h2></div>
            <Row k="Client" v={p.client}/>
            <Row k="Location" v={p.location}/>
            <Row k="Status" v={<span className={"pill " + statusTint[p.status]}>{p.status}</span>}/>
            <Row k="Priority" v={<span className={"pill " + (p.priority === "High" ? "red" : p.priority === "Medium" ? "yellow" : "gray")}>{p.priority}</span>}/>
            <Row k="Due date" v={p.dueDate}/>
            <Row k="Owner" v="Ahmed H."/>
            <Row k="Last updated" v={p.updated} last/>
          </div>

          <div className="card tight">
            <div className="section-h"><h2>Follow-up reminders</h2></div>
            <div style={{display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:"1px solid var(--border)"}}>
              <div style={{width:8, height:8, borderRadius:"50%", background:"#E8A33A", marginTop:5}}></div>
              <div style={{flex:1, fontSize:12.5}}>
                <div style={{fontWeight:500}}>Call procurement re: payment terms</div>
                <div style={{color:"var(--text-3)", marginTop:2}}>Tomorrow, 10:30</div>
              </div>
            </div>
            <div style={{display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0"}}>
              <div style={{width:8, height:8, borderRadius:"50%", background:"#9B9A93", marginTop:5}}></div>
              <div style={{flex:1, fontSize:12.5}}>
                <div style={{fontWeight:500}}>Re-issue quotation v2 with revised markup</div>
                <div style={{color:"var(--text-3)", marginTop:2}}>By Fri May 22</div>
              </div>
            </div>
            <button className="btn ghost sm" style={{marginTop:6}}><Icon name="plus" size={12}/> Add reminder</button>
          </div>

          <div className="card tight">
            <div className="section-h"><h2>Estimate summary</h2></div>
            <Row k="Direct cost" v={<span className="mono">{fmtAED(174300)}</span>}/>
            <Row k="Markup (avg 22%)" v={<span className="mono">{fmtAED(38346)}</span>}/>
            <Row k="Selling total" v={<b className="mono">{fmtAED(212646)}</b>} bold/>
            <Row k="Profit" v={<span className="mono" style={{color:"var(--t-green-fg)"}}>{fmtAED(38346)}</span>} last/>
            <button className="btn" style={{width:"100%", justifyContent:"center", marginTop:10}} onClick={openEstimate}>
              <Icon name="estimate" size={14}/> Open Estimate Builder
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const Row = ({ k, v, last, bold }) => (
  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom: last ? "none" : "1px solid var(--border)", fontSize:12.5}}>
    <span style={{color:"var(--text-3)"}}>{k}</span>
    <span style={{fontWeight: bold ? 600 : 400}}>{v}</span>
  </div>
);

const ProjectNotesTab = ({ p }) => (
  <div className="card">
    <div className="section-h">
      <h2>Project notes</h2>
      <button className="btn ghost sm"><Icon name="plus" size={12}/> Add block</button>
    </div>
    <div style={{fontSize:14, lineHeight:1.7, color:"var(--text-2)"}}>
      <h3 style={{color:"var(--text)", fontSize:16, fontWeight:600, marginTop:0}}>Scope summary</h3>
      <p>{p.client} is renewing their FM contract for {p.name.split("—")[0].trim()}. The building is roughly <b style={{color:"var(--text)"}}>34,000 sqm GFA</b> across {p.scope.includes("HVAC") ? "12 AHUs and 184 FCUs" : "common areas and BoH"}.</p>

      <h3 style={{color:"var(--text)", fontSize:16, fontWeight:600}}>Assumptions</h3>
      <ul style={{marginTop:6, paddingLeft:20}}>
        <li>Working hours: Mon–Sat, 06:00 – 18:00 day shift</li>
        <li>Consumables included in monthly rate</li>
        <li>Public holidays charged at standard rate</li>
        <li>Major repairs (above AED 1,000) approved separately</li>
      </ul>

      <h3 style={{color:"var(--text)", fontSize:16, fontWeight:600}}>Exclusions</h3>
      <ul style={{marginTop:6, paddingLeft:20}}>
        <li>Specialist works (façade access, confined spaces)</li>
        <li>External landscaping & irrigation</li>
        <li>Capital replacements (chillers, gen-set overhaul)</li>
      </ul>

      <h3 style={{color:"var(--text)", fontSize:16, fontWeight:600}}>Client preferences (from site visit)</h3>
      <blockquote style={{margin:"6px 0", padding:"8px 14px", borderLeft:"3px solid var(--border-strong)", color:"var(--text-2)", background:"var(--surface-2)", borderRadius:"0 6px 6px 0"}}>
        "We want a single point of contact for all trades. The previous contractor had four different supervisors and it was a nightmare to coordinate."<br/>
        <span style={{fontSize:12, color:"var(--text-3)"}}>— Procurement Lead, site visit</span>
      </blockquote>
    </div>
  </div>
);

const ProjectEstimateTab = ({ p, onOpen }) => (
  <div className="card">
    <div className="section-h">
      <h2>Estimate — Draft v3</h2>
      <button className="btn" onClick={onOpen}>Open builder <Icon name="chev" size={12}/></button>
    </div>
    <p className="muted" style={{marginTop:0}}>7 line items · last edited 12 min ago</p>
    <table className="table" style={{marginTop:8}}>
      <thead><tr><th>Item</th><th>Category</th><th style={{textAlign:"right"}}>Qty</th><th style={{textAlign:"right"}}>Selling</th><th style={{textAlign:"right"}}>Total</th></tr></thead>
      <tbody>
        <tr><td className="name">Monthly cleaning manpower</td><td><span className="pill gray">Manpower</span></td><td className="mono" style={{textAlign:"right"}}>12</td><td className="mono" style={{textAlign:"right"}}>11,328</td><td className="mono" style={{textAlign:"right"}}>135,936</td></tr>
        <tr><td className="name">Cleaning consumables</td><td><span className="pill gray">Consumables</span></td><td className="mono" style={{textAlign:"right"}}>12</td><td className="mono" style={{textAlign:"right"}}>390</td><td className="mono" style={{textAlign:"right"}}>4,680</td></tr>
        <tr><td className="name">AHU filter replacement</td><td><span className="pill blue">HVAC</span></td><td className="mono" style={{textAlign:"right"}}>64</td><td className="mono" style={{textAlign:"right"}}>47.50</td><td className="mono" style={{textAlign:"right"}}>3,040</td></tr>
        <tr><td className="name">AHU coil chemical clean</td><td><span className="pill blue">HVAC</span></td><td className="mono" style={{textAlign:"right"}}>16</td><td className="mono" style={{textAlign:"right"}}>600</td><td className="mono" style={{textAlign:"right"}}>9,600</td></tr>
        <tr><td className="name">Pest control — quarterly</td><td><span className="pill yellow">Pest Control</span></td><td className="mono" style={{textAlign:"right"}}>4</td><td className="mono" style={{textAlign:"right"}}>455</td><td className="mono" style={{textAlign:"right"}}>1,820</td></tr>
      </tbody>
    </table>
  </div>
);

const ProjectSiteVisitTab = () => (
  <div className="card">
    <div className="section-h">
      <h2>Site visit — May 14</h2>
      <button className="btn ghost sm"><Icon name="camera" size={12}/> Add photo</button>
    </div>
    <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, marginBottom:18}}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{aspectRatio:"4/3", borderRadius:6, background:"var(--surface-2)", border:"1px dashed var(--border-strong)", display:"grid", placeItems:"center", color:"var(--text-3)", fontSize:11}} className="mono">
          PHOTO {i}
        </div>
      ))}
    </div>
    <h4 style={{marginTop:0}}>Field notes</h4>
    <p className="muted" style={{lineHeight:1.6}}>
      Met building manager (Mr. Khaled). Walked the BoH floors, plantrooms, and roof. Building is ~7 years old, well maintained.
      AHU filters last replaced 4 months ago — most look OK but 3 units on level 12 need attention. Bin store needs daily clearance,
      currently only happens every 2 days. Pest control bait stations exist but not on a fixed schedule.
    </p>
  </div>
);

const ProjectTasksTab = () => {
  const [tasks, setTasks] = React.useState([
    { id: 1, text: "Get floor plans from client", done: true },
    { id: 2, text: "Confirm working hours & access", done: true },
    { id: 3, text: "Cost up manpower against UAE labour law", done: true },
    { id: 4, text: "Send draft quotation for internal review", done: false },
    { id: 5, text: "Adjust markup after Faisal's feedback", done: false },
    { id: 6, text: "Final quotation to client by Wed", done: false },
  ]);
  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? {...t, done: !t.done} : t));
  return (
    <div className="card">
      <div className="section-h">
        <h2>Tasks & checklist</h2>
        <span className="muted" style={{fontSize:12}}>{tasks.filter(t => t.done).length}/{tasks.length} complete</span>
      </div>
      {tasks.map(t => (
        <div key={t.id} className={"check" + (t.done ? " done" : "")} onClick={() => toggle(t.id)}>
          <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)}/>
          <label>{t.text}</label>
        </div>
      ))}
    </div>
  );
};

const ProjectFilesTab = () => (
  <div className="card">
    <div className="section-h">
      <h2>Files & attachments</h2>
      <button className="btn ghost sm"><Icon name="plus" size={12}/> Upload</button>
    </div>
    {[
      { n: "RFQ_MarinaHeights_v1.pdf", s: "2.4 MB · pdf" },
      { n: "Floor plans — levels 1–12.pdf", s: "8.1 MB · pdf" },
      { n: "Existing FM contract (redacted).pdf", s: "640 KB · pdf" },
      { n: "Site visit photos.zip", s: "14 photos · 22 MB" },
    ].map(f => (
      <div key={f.n} style={{display:"flex", alignItems:"center", gap:12, padding:"10px 6px", borderBottom:"1px solid var(--border)"}}>
        <div style={{width:32, height:32, borderRadius:6, background:"var(--surface-2)", display:"grid", placeItems:"center", color:"var(--text-2)"}}>
          <Icon name="fileText" size={16}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:500, fontSize:13}}>{f.n}</div>
          <div style={{color:"var(--text-3)", fontSize:11.5}}>{f.s}</div>
        </div>
        <button className="btn ghost sm"><Icon name="download" size={12}/></button>
      </div>
    ))}
  </div>
);

Object.assign(window, { Projects, ProjectDetail });
