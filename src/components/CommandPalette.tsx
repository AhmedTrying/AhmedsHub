"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Calculator,
  Database,
  MapPin,
  KanbanSquare,
  StickyNote,
  Settings as SettingsIcon,
  FolderKanban,
} from "lucide-react";
import { useStore } from "@/lib/store";

interface Action {
  id: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
  do: () => void;
  kbd?: string;
}

export function CommandPalette({
  open,
  onClose,
  openNewProject,
  openNewRate,
  openNewNote,
}: {
  open: boolean;
  onClose: () => void;
  openNewProject: () => void;
  openNewRate: () => void;
  openNewNote: () => void;
}) {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  const actions: Action[] = [
    {
      id: "new-project",
      icon: <Plus size={13} />,
      label: "New project",
      hint: "Start an RFQ",
      do: () => {
        onClose();
        openNewProject();
      },
      kbd: "P",
    },
    {
      id: "new-estimate",
      icon: <Calculator size={13} />,
      label: "New estimate",
      hint: "Open the BOQ builder",
      do: () => go("/estimates/active"),
      kbd: "E",
    },
    {
      id: "new-rate",
      icon: <Database size={13} />,
      label: "Add a rate",
      hint: "Save a benchmark",
      do: () => {
        onClose();
        openNewRate();
      },
      kbd: "R",
    },
    {
      id: "new-note",
      icon: <StickyNote size={13} />,
      label: "Quick note",
      do: () => {
        onClose();
        openNewNote();
      },
    },
    {
      id: "site",
      icon: <MapPin size={13} />,
      label: "Site visit mode",
      hint: "Run the checklist",
      do: () => go("/site-visits"),
    },
    {
      id: "rfq",
      icon: <KanbanSquare size={13} />,
      label: "Open RFQ board",
      do: () => go("/rfqs"),
    },
    {
      id: "projects",
      icon: <FolderKanban size={13} />,
      label: "All projects",
      do: () => go("/projects"),
    },
    {
      id: "settings",
      icon: <SettingsIcon size={13} />,
      label: "Settings",
      do: () => go("/settings"),
    },
  ];

  const filteredActions = actions.filter(
    (a) => q === "" || a.label.toLowerCase().includes(q.toLowerCase())
  );
  const filteredProjects = projects
    .filter(
      (p) =>
        q === "" ||
        (p.name + p.client).toLowerCase().includes(q.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 600, padding: 0 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Search size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Type a command or search…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              color: "var(--text)",
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              padding: "2px 6px",
              border: "1px solid var(--border)",
              borderRadius: 4,
            }}
          >
            ESC
          </span>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: 8 }}>
          {filteredActions.length > 0 && (
            <>
              <div
                style={{
                  padding: "6px 10px",
                  fontSize: 11,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Actions
              </div>
              {filteredActions.map((a) => (
                <button
                  key={a.id}
                  onClick={a.do}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 6,
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text)",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: "var(--surface-2)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                      {a.label}
                    </div>
                    {a.hint && (
                      <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                        {a.hint}
                      </div>
                    )}
                  </div>
                  {a.kbd && (
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: "var(--text-3)",
                        padding: "2px 6px",
                        border: "1px solid var(--border)",
                        borderRadius: 4,
                      }}
                    >
                      ⌘{a.kbd}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
          {filteredProjects.length > 0 && (
            <>
              <div
                style={{
                  padding: "10px 10px 6px",
                  fontSize: 11,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Projects
              </div>
              {filteredProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => go(`/projects/${p.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 6,
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text)",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: "var(--surface-2)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <FolderKanban size={13} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                      {p.client} · {p.status}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
