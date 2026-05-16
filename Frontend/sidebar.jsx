/* global React, Icon */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "projects", label: "Projects", icon: "projects", count: 8 },
  { id: "estimate", label: "Estimate Builder", icon: "estimate" },
  { id: "rates", label: "Rate Library", icon: "rates", count: 12 },
  { id: "rfq", label: "RFQ Tracker", icon: "kanban" },
];
const NAV_2 = [
  { id: "site", label: "Site Visit", icon: "site" },
  { id: "notes", label: "Notes", icon: "notes", count: 6 },
  { id: "templates", label: "Templates", icon: "templates" },
];

const Sidebar = ({ route, setRoute }) => {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="mark">A</div>
        <div>
          <div className="name">Ahmed's Hub</div>
          <div className="sub">Personal FM Workspace</div>
        </div>
      </div>

      <div className="sb-user" title="Account">
        <div className="avatar">AH</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:500, color:"var(--text)"}}>Ahmed H.</div>
          <div style={{fontSize:11, color:"var(--text-3)"}}>Junior Estimator</div>
        </div>
        <Icon name="chevDown" size={14}/>
      </div>

      <div className="sb-section">
        <div className="sb-label">Workspace</div>
        {NAV.map(n => (
          <button key={n.id}
                  className={"sb-item" + (route === n.id ? " active" : "")}
                  onClick={() => setRoute(n.id)}>
            <Icon name={n.icon} size={16}/>
            <span>{n.label}</span>
            {n.count != null && <span className="count">{n.count}</span>}
          </button>
        ))}
      </div>

      <div className="sb-section">
        <div className="sb-label">Field & Notes</div>
        {NAV_2.map(n => (
          <button key={n.id}
                  className={"sb-item" + (route === n.id ? " active" : "")}
                  onClick={() => setRoute(n.id)}>
            <Icon name={n.icon} size={16}/>
            <span>{n.label}</span>
            {n.count != null && <span className="count">{n.count}</span>}
          </button>
        ))}
      </div>

      <div className="sb-section">
        <div className="sb-label">Pinned</div>
        <button className="sb-item" onClick={() => setRoute("projects")}>
          <span style={{color:"var(--text-3)", fontSize:11, width:16, textAlign:"center"}}>★</span>
          <span style={{fontSize:13}}>Marina Heights Tower</span>
        </button>
        <button className="sb-item" onClick={() => setRoute("estimate")}>
          <span style={{color:"var(--text-3)", fontSize:11, width:16, textAlign:"center"}}>★</span>
          <span style={{fontSize:13}}>Estimate — v3 draft</span>
        </button>
        <button className="sb-item" onClick={() => setRoute("rates")}>
          <span style={{color:"var(--text-3)", fontSize:11, width:16, textAlign:"center"}}>★</span>
          <span style={{fontSize:13}}>FY25 manpower rates</span>
        </button>
      </div>

      <div className="sb-spacer"></div>

      <button className="sb-item" onClick={() => setRoute("settings")}
              style={route === "settings" ? {background:"var(--surface-hover)", color:"var(--text)", fontWeight:500} : {}}>
        <Icon name="settings" size={16}/>
        <span>Settings</span>
      </button>
      <div className="sb-foot">
        <div style={{width:6, height:6, borderRadius:"50%", background:"#3CB371"}}></div>
        Synced · just now
      </div>
    </aside>
  );
};

const Topbar = ({ crumbs, onSearch, onNew, onTheme, theme }) => {
  return (
    <div className="topbar">
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            <span className={i === crumbs.length - 1 ? "here" : ""}>{c}</span>
            {i < crumbs.length - 1 && <span className="sep">/</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="tb-spacer"></div>
      <div className="tb-search">
        <Icon name="search" size={14}/>
        <input placeholder="Search projects, rates, notes…" onChange={e => onSearch?.(e.target.value)}/>
        <span className="mono" style={{fontSize:11, color:"var(--text-3)"}}>⌘K</span>
      </div>
      <button className="tb-icon-btn" title="Toggle theme" onClick={onTheme}>
        <Icon name={theme === "dark" ? "sun" : "moon"} size={16}/>
      </button>
      <button className="tb-icon-btn" title="Notifications">
        <Icon name="bell" size={16}/>
      </button>
      <button className="btn primary" onClick={onNew}>
        <Icon name="plus" size={14}/> New
      </button>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar });
