"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  Download,
  Table as TableIcon,
  KanbanSquare,
  MoreHorizontal,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { fmtAED } from "@/lib/format";
import { statusTint, scopeTint, priorityDot, statusOptions } from "@/lib/tints";
import { Pill } from "@/components/Pill";
import type { ProjectStatus } from "@/lib/types";

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const { setNewProjectOpen } = useUI();

  const [filter, setFilter] = useState<"All" | ProjectStatus>("All");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"table" | "board">("table");

  const filtered = projects.filter(
    (p) =>
      (filter === "All" || p.status === filter) &&
      (q === "" ||
        (p.name + p.client + p.location)
          .toLowerCase()
          .includes(q.toLowerCase()))
  );

  return (
    <div className="page wide">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">
            All active and archived RFQs you&apos;re working on.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn">
            <Download size={14} /> Export
          </button>
          <button
            className="btn primary"
            onClick={() => setNewProjectOpen(true)}
          >
            <Plus size={14} /> New project
          </button>
        </div>
      </div>

      <div className="filterbar">
        <div className="tb-search" style={{ width: 280 }}>
          <Search size={14} />
          <input
            placeholder="Search projects, clients, locations…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {(["All", ...statusOptions] as const).map((s) => (
          <button
            key={s}
            className={"chip" + (filter === s ? " active" : "")}
            onClick={() => setFilter(s)}
          >
            {s}
            {filter !== s && s !== "All" && (
              <span style={{ color: "var(--text-3)", fontSize: 11 }}>
                {projects.filter((p) => p.status === s).length}
              </span>
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="btn">
          <Filter size={14} /> Scope
        </button>
        <div
          style={{
            display: "flex",
            border: "1px solid var(--border)",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <button
            className="btn ghost sm"
            onClick={() => setView("table")}
            style={{
              borderRadius: 0,
              background:
                view === "table" ? "var(--surface-hover)" : "transparent",
            }}
          >
            <TableIcon size={14} /> Table
          </button>
          <button
            className="btn ghost sm"
            onClick={() => setView("board")}
            style={{
              borderRadius: 0,
              background:
                view === "board" ? "var(--surface-hover)" : "transparent",
            }}
          >
            <KanbanSquare size={14} /> Board
          </button>
        </div>
      </div>

      {view === "table" ? (
        <div
          className="card tight"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: 18, width: "30%" }}>Project</th>
                <th>Client</th>
                <th>Location</th>
                <th>Scope</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Value</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="name" style={{ paddingLeft: 18 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: priorityDot[p.priority],
                        }}
                      />
                      {p.name}
                    </div>
                  </td>
                  <td className="muted">{p.client}</td>
                  <td className="muted">{p.location}</td>
                  <td>
                    <div
                      style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                    >
                      {p.scope.map((s) => (
                        <Pill key={s} tone={scopeTint[s]}>
                          {s}
                        </Pill>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Pill tone={statusTint[p.status]} dot>
                      {p.status}
                    </Pill>
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>
                    {p.value ? fmtAED(p.value) : "—"}
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>
                    {p.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty">No projects match your filters.</div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="card tight"
              style={{ cursor: "pointer", textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Pill tone={statusTint[p.status]} dot>
                  {p.status}
                </Pill>
                <MoreHorizontal size={14} />
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  marginTop: 10,
                  lineHeight: 1.3,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  color: "var(--text-3)",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {p.client}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  marginTop: 10,
                }}
              >
                {p.scope.map((s) => (
                  <Pill key={s} tone={scopeTint[s]}>
                    {s}
                  </Pill>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                  {p.location}
                </span>
                <span
                  className="mono"
                  style={{ fontSize: 12, fontWeight: 500 }}
                >
                  {p.value ? fmtAED(p.value) : "—"}
                </span>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="empty" style={{ gridColumn: "1 / -1" }}>
              No projects match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
