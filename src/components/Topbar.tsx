"use client";

import React from "react";
import { Search, Sun, Moon, Bell, Plus } from "lucide-react";
import { useStore } from "@/lib/store";

export function Topbar({
  crumbs,
  onOpenPalette,
  onNew,
}: {
  crumbs: string[];
  onOpenPalette: () => void;
  onNew: () => void;
}) {
  const theme = useStore((s) => s.settings.theme);
  const updateSettings = useStore((s) => s.updateSettings);

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
      <div className="tb-spacer" />
      <button
        className="tb-search"
        onClick={onOpenPalette}
        style={{ cursor: "pointer", textAlign: "left" }}
      >
        <Search size={14} />
        <span style={{ flex: 1, color: "var(--text-3)" }}>
          Search projects, rates, notes…
        </span>
        <span
          className="mono"
          style={{ fontSize: 11, color: "var(--text-3)" }}
        >
          ⌘K
        </span>
      </button>
      <button
        className="tb-icon-btn"
        title="Toggle theme"
        onClick={() =>
          updateSettings({ theme: theme === "dark" ? "light" : "dark" })
        }
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button className="tb-icon-btn" title="Notifications">
        <Bell size={16} />
      </button>
      <button className="btn primary" onClick={onNew}>
        <Plus size={14} /> New
      </button>
    </div>
  );
}
