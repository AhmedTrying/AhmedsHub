"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  Calculator,
  Database,
  MapPin,
  StickyNote,
  Plus,
  Clock,
  ChevronRight,
  KanbanSquare,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { fmtAED, greeting, todayLong } from "@/lib/format";
import { statusTint, priorityDot } from "@/lib/tints";
import { Pill } from "@/components/Pill";

function QuickAction({
  icon,
  label,
  sub,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <div
      className="card tight"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        textAlign: "left",
        cursor: "pointer",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "var(--surface-2)",
          display: "grid",
          placeItems: "center",
          color: "var(--text)",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 13.5 }}>{label}</div>
        <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{sub}</div>
      </div>
      <ChevronRight size={14} />
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return (
    <button
      onClick={onClick}
      style={{ background: "transparent", border: "none", padding: 0, textAlign: "left" }}
    >
      {inner}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const projects = useStore((s) => s.projects);
  const rates = useStore((s) => s.rates);
  const estimates = useStore((s) => s.estimates);
  const activity = useStore((s) => s.activity);
  const personalName = useStore((s) => s.settings.personalName);
  const { setNewProjectOpen, setNewRateOpen, setNewNoteOpen } = useUI();

  const active = projects.filter((p) =>
    ["New", "Site Visit", "Pricing", "Quotation Sent", "Follow Up"].includes(
      p.status
    )
  );
  const followups = projects.filter((p) =>
    ["Follow Up", "Quotation Sent"].includes(p.status)
  );
  const todays = active.slice(0, 3);

  const firstName = personalName.split(" ")[0] || "Ahmed";

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div>
          <div
            style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 6 }}
          >
            {todayLong()}
          </div>
          <h1 className="page-title">
            {greeting()}, {firstName}.
          </h1>
          <p className="page-sub">
            You&apos;ve got{" "}
            <b style={{ color: "var(--text)" }}>
              {followups.length} quotation{followups.length === 1 ? "" : "s"}
            </b>{" "}
            to finalize and a few site visits this week. Let&apos;s get to it.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setNewNoteOpen(true)}>
            <StickyNote size={14} /> Quick note
          </button>
          <button className="btn primary" onClick={() => setNewProjectOpen(true)}>
            <Plus size={14} /> New project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginTop: 16 }}>
        <div className="stat">
          <div className="label">
            <FolderKanban size={13} /> Active Projects
          </div>
          <div className="value">{active.length}</div>
          <div className="delta up">{projects.length} total</div>
        </div>
        <div className="stat">
          <div className="label">
            <Calculator size={13} /> Estimates Created
          </div>
          <div className="value">{estimates.length}</div>
          <div className="delta">latest version saved</div>
        </div>
        <div className="stat">
          <div className="label">
            <Clock size={13} /> Pending Follow-ups
          </div>
          <div className="value">{followups.length}</div>
          <div className="delta down">
            {projects.filter((p) => p.priority === "High").length} high priority
          </div>
        </div>
        <div className="stat">
          <div className="label">
            <Database size={13} /> Saved Rate Items
          </div>
          <div className="value">{rates.length}</div>
          <div className="delta">in your library</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ marginTop: 24 }}>
        <div className="section-h">
          <h2>Quick actions</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          <QuickAction
            icon={<FolderKanban size={17} />}
            label="New project"
            sub="Start a fresh RFQ"
            onClick={() => setNewProjectOpen(true)}
          />
          <QuickAction
            icon={<Calculator size={17} />}
            label="New estimate"
            sub="Open the BOQ builder"
            href={`/estimates/${estimates[0]?.id ?? "active"}`}
          />
          <QuickAction
            icon={<Database size={17} />}
            label="Add a rate"
            sub="Save to your library"
            onClick={() => setNewRateOpen(true)}
          />
          <QuickAction
            icon={<MapPin size={17} />}
            label="Site visit note"
            sub="Checklist + photos"
            href="/site-visits"
          />
        </div>
      </div>

      {/* Today's focus + activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginTop: 24,
        }}
      >
        <div className="card">
          <div className="section-h">
            <h2>Today&apos;s focus</h2>
            <Link href="/projects" className="btn ghost sm">
              View all
              <ChevronRight size={12} />
            </Link>
          </div>
          {todays.length === 0 ? (
            <div className="empty">Nothing active right now.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {todays.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 4px",
                    borderRadius: 6,
                    cursor: "pointer",
                    borderTop: i ? "1px solid var(--border)" : "none",
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                      {p.name}
                    </div>
                    <div
                      style={{
                        color: "var(--text-3)",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {p.next || "No next step"}
                    </div>
                  </div>
                  <Pill tone={statusTint[p.status]}>{p.status}</Pill>
                  <div
                    style={{
                      width: 100,
                      textAlign: "right",
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 12,
                      color: "var(--text-2)",
                    }}
                  >
                    {p.value ? fmtAED(p.value) : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-h">
            <h2>Recent activity</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {activity.slice(0, 6).map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "var(--surface-2)",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--text-2)",
                    flexShrink: 0,
                  }}
                >
                  <Clock size={13} />
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>
                  <b style={{ fontWeight: 500 }}>{a.who}</b>{" "}
                  <span className="muted">{a.what}</span>{" "}
                  <b style={{ fontWeight: 500 }}>{a.on}</b>
                  <div
                    style={{
                      color: "var(--text-3)",
                      fontSize: 11.5,
                      marginTop: 2,
                    }}
                  >
                    {a.when}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active RFQs + this week */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        <div className="card">
          <div className="section-h">
            <h2>Active RFQs</h2>
            <Link href="/rfqs" className="btn ghost sm">
              <KanbanSquare size={12} /> Open board
              <ChevronRight size={12} />
            </Link>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Value</th>
              </tr>
            </thead>
            <tbody>
              {active.slice(0, 5).map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/projects/${p.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="name">{p.name}</td>
                  <td className="muted">{p.client}</td>
                  <td>
                    <Pill tone={statusTint[p.status]} dot>
                      {p.status}
                    </Pill>
                  </td>
                  <td className="mono" style={{ textAlign: "right" }}>
                    {p.value ? fmtAED(p.value) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-h">
            <h2>This week</h2>
            <span className="muted" style={{ fontSize: 12 }}>
              May 18–24
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                d: "18",
                w: "Mon",
                title: "Al Quoz Warehouse — site visit",
                sub: "15:00 · Bring measuring wheel",
              },
              {
                d: "20",
                w: "Wed",
                title: "JLT — quotation due",
                sub: "Submit before 17:00",
              },
              {
                d: "22",
                w: "Fri",
                title: "Marina Heights — follow-up call",
                sub: "10:30 · Procurement team",
              },
            ].map((row, i, arr) => (
              <div
                key={row.d}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "8px 0",
                  borderBottom:
                    i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{ width: 40, textAlign: "center" }}>
                  <div
                    className="mono"
                    style={{ fontSize: 18, fontWeight: 600 }}
                  >
                    {row.d}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {row.w}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {row.title}
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 12 }}>
                    {row.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
