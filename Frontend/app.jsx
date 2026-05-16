/* global React, ReactDOM, Sidebar, Topbar, Dashboard, Projects, ProjectDetail, EstimateBuilder, RateLibrary, SiteVisit, Notes, RFQTracker, Templates, Settings, ToastProvider, ToastContext, Modal, Icon, useTweaks, TweaksPanel, TweakRadio, TweakColor, TweakToggle, TweakSection, TweakSelect, PROJECTS */

const CRUMBS = {
  dashboard: ["Workspace", "Dashboard"],
  projects: ["Workspace", "Projects"],
  estimate: ["Workspace", "Estimate Builder"],
  rates: ["Workspace", "Rate Library"],
  rfq: ["Workspace", "RFQ Tracker"],
  site: ["Field & Notes", "Site Visit"],
  notes: ["Field & Notes", "Notes"],
  templates: ["Field & Notes", "Templates"],
  settings: ["Personal", "Settings"],
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "#2383E2",
  "density": "comfortable"
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState("dashboard");
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [newRateOpen, setNewRateOpen] = React.useState(false);
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  // Apply theme + accent
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme);
    document.documentElement.style.setProperty("--accent", tweaks.accent);
    document.documentElement.style.setProperty("font-size", tweaks.density === "compact" ? "13px" : "14px");
  }, [tweaks.theme, tweaks.accent, tweaks.density]);

  // ⌘K
  React.useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(p => !p); }
      if (e.key === "Escape") { setPaletteOpen(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const goto = r => {
    if (r.startsWith("project:")) {
      window._currentProjectId = r.split(":")[1];
      setRoute("project");
    } else {
      setRoute(r);
    }
  };

  let body, crumbs;
  if (route === "project") {
    const p = PROJECTS.find(x => x.id === window._currentProjectId);
    body = <ProjectDetail id={window._currentProjectId} goto={goto} openEstimate={() => goto("estimate")}/>;
    crumbs = ["Workspace", "Projects", p ? p.name : "Project"];
  } else {
    crumbs = CRUMBS[route] || ["Workspace"];
    switch (route) {
      case "dashboard": body = <Dashboard goto={goto} openNewProject={() => setNewProjectOpen(true)} openNewRate={() => setNewRateOpen(true)}/>; break;
      case "projects": body = <Projects goto={goto}/>; break;
      case "estimate": body = <EstimateBuilder/>; break;
      case "rates": body = <RateLibrary/>; break;
      case "rfq": body = <RFQTracker/>; break;
      case "site": body = <SiteVisit/>; break;
      case "notes": body = <Notes/>; break;
      case "templates": body = <Templates/>; break;
      case "settings": body = <Settings theme={tweaks.theme} setTheme={t => setTweak("theme", t)}/>; break;
      default: body = <Dashboard goto={goto}/>;
    }
  }

  return (
    <div className="app">
      <Sidebar route={route === "project" ? "projects" : route} setRoute={goto}/>
      <div className="main">
        <Topbar
          crumbs={crumbs}
          onSearch={() => {}}
          onNew={() => setPaletteOpen(true)}
          onTheme={() => setTweak("theme", tweaks.theme === "dark" ? "light" : "dark")}
          theme={tweaks.theme}
        />
        {body}
      </div>

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} goto={goto}
                      openNewProject={() => { setPaletteOpen(false); setNewProjectOpen(true); }}
                      openNewRate={() => { setPaletteOpen(false); setNewRateOpen(true); }}/>

      {/* New project */}
      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)}/>
      {/* New rate (lightweight version) */}
      <NewRateModal open={newRateOpen} onClose={() => setNewRateOpen(false)}/>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance" />
        <TweakRadio label="Theme" value={tweaks.theme}
                    options={["light", "dark"]}
                    onChange={v => setTweak("theme", v)}/>
        <TweakRadio label="Density" value={tweaks.density}
                    options={["comfortable", "compact"]}
                    onChange={v => setTweak("density", v)}/>
        <TweakSection label="Accent" />
        <TweakColor label="Color" value={tweaks.accent}
                    options={["#2383E2", "#0F9D6B", "#E25F23", "#6440A1", "#37352F"]}
                    onChange={v => setTweak("accent", v)}/>
      </TweaksPanel>
    </div>
  );
};

// ============ COMMAND PALETTE ============
const CommandPalette = ({ open, onClose, goto, openNewProject, openNewRate }) => {
  const [q, setQ] = React.useState("");
  const actions = [
    { id: "new-project", icon: "plus", label: "New project", hint: "Start an RFQ", do: openNewProject, kbd: "P" },
    { id: "new-estimate", icon: "estimate", label: "New estimate", hint: "Open the BOQ builder", do: () => { onClose(); goto("estimate"); }, kbd: "E" },
    { id: "new-rate", icon: "rates", label: "Add a rate", hint: "Save a benchmark", do: openNewRate, kbd: "R" },
    { id: "site", icon: "site", label: "Site visit mode", hint: "Run the checklist", do: () => { onClose(); goto("site"); } },
    { id: "rfq", icon: "kanban", label: "Open RFQ board", do: () => { onClose(); goto("rfq"); } },
    { id: "notes", icon: "notes", label: "Search notes", do: () => { onClose(); goto("notes"); } },
    { id: "settings", icon: "settings", label: "Settings", do: () => { onClose(); goto("settings"); } },
  ];
  const projects = PROJECTS.filter(p => q === "" || p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4);
  const filtAct = actions.filter(a => q === "" || a.label.toLowerCase().includes(q.toLowerCase()));

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{width:600, padding:0}}>
        <div style={{display:"flex", alignItems:"center", gap:8, padding:"14px 16px", borderBottom:"1px solid var(--border)"}}>
          <Icon name="search" size={18}/>
          <input value={q} onChange={e => setQ(e.target.value)} autoFocus
                 placeholder="Type a command or search…"
                 style={{flex:1, border:"none", outline:"none", background:"transparent", fontSize:15, color:"var(--text)"}}/>
          <span className="mono" style={{fontSize:11, color:"var(--text-3)", padding:"2px 6px", border:"1px solid var(--border)", borderRadius:4}}>ESC</span>
        </div>
        <div style={{maxHeight:380, overflowY:"auto", padding:8}}>
          {filtAct.length > 0 && (
            <>
              <div style={{padding:"6px 10px", fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.04em"}}>Actions</div>
              {filtAct.map(a => (
                <button key={a.id} onClick={a.do}
                        style={{display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:6, width:"100%", border:"none", background:"transparent", cursor:"pointer", color:"var(--text)", textAlign:"left"}}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{width:24, height:24, borderRadius:5, background:"var(--surface-2)", display:"grid", placeItems:"center"}}>
                    <Icon name={a.icon} size={13}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5, fontWeight:500}}>{a.label}</div>
                    {a.hint && <div style={{fontSize:11.5, color:"var(--text-3)"}}>{a.hint}</div>}
                  </div>
                  {a.kbd && <span className="mono" style={{fontSize:11, color:"var(--text-3)", padding:"2px 6px", border:"1px solid var(--border)", borderRadius:4}}>⌘{a.kbd}</span>}
                </button>
              ))}
            </>
          )}
          {projects.length > 0 && (
            <>
              <div style={{padding:"10px 10px 6px", fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.04em"}}>Projects</div>
              {projects.map(p => (
                <button key={p.id} onClick={() => { onClose(); goto("project:" + p.id); }}
                        style={{display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:6, width:"100%", border:"none", background:"transparent", cursor:"pointer", color:"var(--text)", textAlign:"left"}}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--surface-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{width:24, height:24, borderRadius:5, background:"var(--surface-2)", display:"grid", placeItems:"center"}}>
                    <Icon name="projects" size={13}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5, fontWeight:500}}>{p.name}</div>
                    <div style={{fontSize:11.5, color:"var(--text-3)"}}>{p.client} · {p.status}</div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ NEW PROJECT ============
const NewProjectModal = ({ open, onClose }) => {
  const { push } = React.useContext(ToastContext);
  const [scopes, setScopes] = React.useState(["Cleaning"]);
  const SCOPES = ["HVAC", "Cleaning", "MEP", "Civil", "Pest Control", "Security", "Landscaping"];
  return (
    <Modal open={open} onClose={onClose} title="New project" subtitle="Capture the basics — you can edit anything later."
           footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={() => { onClose(); push("Project created"); }}>Create project</button></>}>
      <div className="col gap-12">
        <div className="field">
          <label>Project name</label>
          <input className="input" placeholder="e.g. Marina Heights Tower — Annual FM" autoFocus/>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Client</label>
            <input className="input" placeholder="Client name"/>
          </div>
          <div className="field">
            <label>Location</label>
            <input className="input" placeholder="Dubai Marina"/>
          </div>
        </div>
        <div className="field">
          <label>Scope</label>
          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
            {SCOPES.map(s => (
              <button key={s} className={"chip" + (scopes.includes(s) ? " active" : "")}
                      onClick={() => setScopes(sc => sc.includes(s) ? sc.filter(x => x !== s) : [...sc, s])}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Estimated value</label>
            <input className="input mono" placeholder="AED 0"/>
          </div>
          <div className="field">
            <label>Due date</label>
            <input className="input" placeholder="DD MMM YYYY" defaultValue="22 May 2026"/>
          </div>
        </div>
        <div className="field">
          <label>Status</label>
          <select className="input"><option>New</option><option>Site Visit</option><option>Pricing</option></select>
        </div>
      </div>
    </Modal>
  );
};

const NewRateModal = ({ open, onClose }) => {
  const { push } = React.useContext(ToastContext);
  return (
    <Modal open={open} onClose={onClose} title="Add new rate" subtitle="Save a benchmark you can pull into any estimate"
           footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={() => { onClose(); push("Rate saved to library"); }}>Save</button></>}>
      <div className="col gap-12">
        <div className="field">
          <label>Item name</label>
          <input className="input" placeholder="e.g. AHU filter — pleated MERV 8" autoFocus/>
        </div>
        <div className="grid-2">
          <div className="field"><label>Category</label><select className="input"><option>Cleaning</option><option>HVAC</option><option>Electrical</option><option>Plumbing</option><option>Civil</option><option>Manpower</option><option>Consumables</option><option>Safety</option><option>Pest Control</option></select></div>
          <div className="field"><label>Unit</label><input className="input" placeholder="pc / sqm / month"/></div>
        </div>
        <div className="grid-2">
          <div className="field"><label>Rate (AED)</label><input className="input mono" placeholder="0.00"/></div>
          <div className="field"><label>Supplier</label><input className="input" placeholder="e.g. Camfil ME"/></div>
        </div>
      </div>
    </Modal>
  );
};

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ToastProvider>
    <App/>
  </ToastProvider>
);
