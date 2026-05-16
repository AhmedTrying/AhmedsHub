"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Calculator,
  Database,
  KanbanSquare,
  MapPin,
  StickyNote,
  LayoutTemplate,
  Settings as SettingsIcon,
  ChevronDown,
  Star,
} from "lucide-react";
import { useStore } from "@/lib/store";

const PRIMARY = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/projects", label: "Projects", icon: FolderKanban, match: (p: string) => p.startsWith("/projects") },
  { href: "/estimates/active", label: "Estimate Builder", icon: Calculator, match: (p: string) => p.startsWith("/estimates") },
  { href: "/rates", label: "Rate Library", icon: Database, match: (p: string) => p.startsWith("/rates") },
  { href: "/rfqs", label: "RFQ Tracker", icon: KanbanSquare, match: (p: string) => p.startsWith("/rfqs") },
];

const FIELD = [
  { href: "/site-visits", label: "Site Visit", icon: MapPin, match: (p: string) => p.startsWith("/site-visits") },
  { href: "/notes", label: "Notes", icon: StickyNote, match: (p: string) => p.startsWith("/notes") },
  { href: "/templates", label: "Templates", icon: LayoutTemplate, match: (p: string) => p.startsWith("/templates") },
];

export function Sidebar() {
  const pathname = usePathname() || "/";
  const projects = useStore((s) => s.projects);
  const notes = useStore((s) => s.notes);
  const pinned = projects.filter((p) => p.pinned).slice(0, 4);

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="mark">A</div>
        <div>
          <div className="name">Ahmed&apos;s Hub</div>
          <div className="sub">Personal FM Workspace</div>
        </div>
      </div>

      <div className="sb-user" title="Account">
        <div className="avatar">AH</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
            Ahmed H.
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>
            Junior Estimator
          </div>
        </div>
        <ChevronDown size={14} />
      </div>

      <div className="sb-section">
        <div className="sb-label">Workspace</div>
        {PRIMARY.map((n) => {
          const Icon = n.icon;
          const active = n.match(pathname);
          const count =
            n.label === "Projects"
              ? projects.length
              : n.label === "Rate Library"
                ? useStore.getState().rates.length
                : undefined;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={"sb-item" + (active ? " active" : "")}
            >
              <Icon size={16} />
              <span>{n.label}</span>
              {count != null && <span className="count">{count}</span>}
            </Link>
          );
        })}
      </div>

      <div className="sb-section">
        <div className="sb-label">Field &amp; Notes</div>
        {FIELD.map((n) => {
          const Icon = n.icon;
          const active = n.match(pathname);
          const count = n.label === "Notes" ? notes.length : undefined;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={"sb-item" + (active ? " active" : "")}
            >
              <Icon size={16} />
              <span>{n.label}</span>
              {count != null && <span className="count">{count}</span>}
            </Link>
          );
        })}
      </div>

      {pinned.length > 0 && (
        <div className="sb-section">
          <div className="sb-label">Pinned</div>
          {pinned.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="sb-item"
              title={p.name}
            >
              <Star size={12} />
              <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="sb-spacer" />

      <Link
        href="/settings"
        className={
          "sb-item" + (pathname.startsWith("/settings") ? " active" : "")
        }
      >
        <SettingsIcon size={16} />
        <span>Settings</span>
      </Link>
      <div className="sb-foot">
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#3CB371",
          }}
        />
        Synced · just now
      </div>
    </aside>
  );
}
