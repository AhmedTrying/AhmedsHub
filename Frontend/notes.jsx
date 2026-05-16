/* global React, Icon, NOTES_SEED, ToastContext, Modal, PROJECTS */

const Notes = () => {
  const { push } = React.useContext(ToastContext);
  const [notes, setNotes] = React.useState(NOTES_SEED);
  const [q, setQ] = React.useState("");
  const [tag, setTag] = React.useState("All");
  const [selected, setSelected] = React.useState(NOTES_SEED[0].id);
  const [newOpen, setNewOpen] = React.useState(false);

  const allTags = ["All", ...new Set(notes.flatMap(n => n.tags))];
  const filtered = notes
    .filter(n => (tag === "All" || n.tags.includes(tag)) && (q === "" || (n.title + n.body).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const togglePin = id => setNotes(ns => ns.map(n => n.id === id ? {...n, pinned: !n.pinned} : n));
  const current = notes.find(n => n.id === selected) || notes[0];
  const currentProject = PROJECTS.find(p => p.id === current.project);

  return (
    <div className="page wide" style={{padding:0, maxWidth:"none"}}>
      <div style={{display:"grid", gridTemplateColumns:"360px 1fr", minHeight:"calc(100vh - 50px)"}}>
        {/* List */}
        <div style={{borderRight:"1px solid var(--border)", background:"var(--bg-soft)", display:"flex", flexDirection:"column"}}>
          <div style={{padding:"16px 16px 10px", borderBottom:"1px solid var(--border)"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
              <h2 style={{margin:0, fontSize:16, fontWeight:600}}>Notes</h2>
              <button className="btn sm primary" onClick={() => setNewOpen(true)}>
                <Icon name="plus" size={13}/> New
              </button>
            </div>
            <div className="tb-search">
              <Icon name="search" size={14}/>
              <input placeholder="Search notes…" value={q} onChange={e => setQ(e.target.value)}/>
            </div>
            <div style={{display:"flex", gap:4, marginTop:10, flexWrap:"wrap"}}>
              {allTags.slice(0, 6).map(t => (
                <button key={t} className={"chip" + (tag === t ? " active" : "")} onClick={() => setTag(t)} style={{fontSize:11.5, padding:"2px 8px"}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{flex:1, overflowY:"auto", padding:8}}>
            {filtered.map(n => (
              <div key={n.id} onClick={() => setSelected(n.id)}
                   style={{padding:"10px 12px", borderRadius:6, cursor:"pointer",
                           background: selected === n.id ? "var(--surface)" : "transparent",
                           border: "1px solid " + (selected === n.id ? "var(--border-strong)" : "transparent"),
                           marginBottom:2}}>
                <div style={{display:"flex", alignItems:"flex-start", gap:6}}>
                  {n.pinned && <Icon name="star" size={11} stroke={2}/>}
                  <div style={{fontWeight:500, fontSize:13.5, flex:1, lineHeight:1.3}}>{n.title}</div>
                </div>
                <div style={{color:"var(--text-2)", fontSize:12, marginTop:4, lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{n.body}</div>
                <div style={{display:"flex", alignItems:"center", gap:6, marginTop:8, fontSize:11, color:"var(--text-3)"}}>
                  <span>{n.when}</span>
                  {n.tags.slice(0,2).map(t => <span key={t} style={{padding:"0 5px", background:"var(--surface-2)", borderRadius:3}}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        {current && (
          <div style={{padding:"28px 40px 80px", maxWidth:840, margin:"0 auto", width:"100%"}}>
            <div style={{display:"flex", gap:6, marginBottom:10, color:"var(--text-3)", fontSize:12, alignItems:"center"}}>
              {currentProject && (<>
                <Icon name="projects" size={12}/>
                <span>{currentProject.name}</span>
                <span>·</span>
              </>)}
              <Icon name="clock" size={12}/>
              <span>{current.when}</span>
              <div style={{flex:1}}></div>
              <button className="btn ghost sm" onClick={() => togglePin(current.id)}>
                <Icon name="star" size={13} stroke={current.pinned ? 2.4 : 1.6}/> {current.pinned ? "Pinned" : "Pin"}
              </button>
              <button className="btn ghost sm"><Icon name="more" size={14}/></button>
            </div>
            <h1 style={{fontSize:32, letterSpacing:"-0.02em", fontWeight:700, margin:"0 0 14px"}}>{current.title}</h1>
            <div style={{display:"flex", gap:4, marginBottom:18}}>
              {current.tags.map(t => <span key={t} className="pill gray">#{t}</span>)}
            </div>
            <div style={{fontSize:15, lineHeight:1.7, color:"var(--text-2)"}}>
              <p>{current.body}</p>
              <p>Additional context — once this is resolved, update the relevant estimate line items and re-check markup. If the client confirms in writing, also save the email under Files for audit.</p>

              <h3 style={{color:"var(--text)", fontSize:17, fontWeight:600, marginTop:24}}>Open questions</h3>
              <ul>
                <li>Who supplies consumables — FM or tenant?</li>
                <li>Are public holidays charged at standard or premium rate?</li>
                <li>Is the warranty period 30 or 60 days for repair works?</li>
              </ul>

              <h3 style={{color:"var(--text)", fontSize:17, fontWeight:600, marginTop:24}}>Next steps</h3>
              <ol>
                <li>Email procurement contact by EOD with the three open questions.</li>
                <li>Once answered, update the estimate and re-issue v2.</li>
                <li>Loop Faisal in on the cover note before sending.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Quick note"
             footer={<><button className="btn" onClick={() => setNewOpen(false)}>Cancel</button><button className="btn primary" onClick={() => { setNewOpen(false); push("Note saved"); }}>Save note</button></>}>
        <div className="col gap-12">
          <input className="input" placeholder="Title" style={{fontSize:15, fontWeight:500, padding:"8px 12px"}} autoFocus/>
          <textarea className="input" rows={5} placeholder="Write your note…"></textarea>
          <div className="grid-2">
            <div className="field">
              <label>Tag</label>
              <input className="input" placeholder="e.g. HVAC, Supplier"/>
            </div>
            <div className="field">
              <label>Link to project</label>
              <select className="input">
                <option value="">— None —</option>
                {PROJECTS.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

Object.assign(window, { Notes });
